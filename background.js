let countdownTimer = null;

// Biến lưu trữ "Bộ nhớ Tab"
let lastActiveSafeTabId = null; 
let lastActiveSafeUrl = null; 

function checkFocusStatus() {
  chrome.storage.local.get(['focusTargets', 'isAppOn'], (result) => {
    if (result.isAppOn === false) {
      clearTimer();
      return;
    }

    const targets = result.focusTargets || [];
    if (targets.length === 0) {
      clearTimer();
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const currentTab = tabs[0];
      
      if (!currentTab.url || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('edge://') || currentTab.url.startsWith('chrome-extension://')) {
         clearTimer();
         return;
      }

      let isMatch = false;
      for (let target of targets) {
        try {
          if (target.url && checkMatch(currentTab.url, target.url, target.mode)) {
            isMatch = true;
            break;
          }
        } catch (e) {
          console.error("Lỗi phân tích URL:", e);
        }
      }

      if (!isMatch) {
        // Mất tập trung -> Đếm ngược
        if (!countdownTimer) {
          countdownTimer = setTimeout(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
              if (activeTabs.length > 0) {
                triggerReminder(activeTabs[0].id);
              }
            });
            countdownTimer = null; 
          }, 10000);
        }
      } else {
        // Đang ở tab an toàn -> Ghi nhớ lại Tab này làm điểm quay về
        lastActiveSafeTabId = currentTab.id;
        lastActiveSafeUrl = currentTab.url; // Lưu lại link thực tế để phòng lỡ tay tắt tab
        clearTimer();
      }
    });
  });
}

function checkMatch(currentUrl, targetUrl, mode) {
  if (!currentUrl || !targetUrl) return false;
  
  let cleanTarget = targetUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').trim();
  let cleanCurrent = currentUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').trim();

  if (mode === 'strict') {
    return cleanCurrent === cleanTarget;
  } else {
    // CHẾ ĐỘ DOMAIN THÔNG MINH:
    // Cắt toàn bộ đường dẫn từ dấu "/" đầu tiên, chỉ lấy cái Tên miền gốc
    let targetDomain = cleanTarget.split('/')[0].split('?')[0]; 
    let currentDomain = cleanCurrent.split('/')[0].split('?')[0];

    // Chỉ cần trùng tên miền (VD: desmos.com == desmos.com) là cho phép toàn bộ web
    return currentDomain === targetDomain;
  }
}

function clearTimer() {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
}

function triggerReminder(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }).catch(err => console.error("Lỗi hiển thị:", err));
}

chrome.tabs.onActivated.addListener(checkFocusStatus);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    checkFocusStatus();
  }
});
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    checkFocusStatus();
  }
});
chrome.storage.onChanged.addListener(() => {
  checkFocusStatus();
});

// XỬ LÝ NÚT QUAY LẠI THÔNG MINH
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "returnToTarget") {
    chrome.storage.local.get(['focusTargets'], (result) => {
       const targets = result.focusTargets || [];
       if (targets.length === 0) return;
       
       // Bước 1: Ưu tiên quay về đúng Tab ID an toàn gần nhất
       if (lastActiveSafeTabId) {
          chrome.tabs.get(lastActiveSafeTabId, (tab) => {
             // Nếu tab đã bị tắt, nhảy sang Bước 2
             if (chrome.runtime.lastError || !tab) {
                fallbackReturn(targets);
             } else {
                // Tab vẫn còn sống -> Kéo user về tab đó
                chrome.tabs.update(lastActiveSafeTabId, { active: true });
                chrome.windows.update(tab.windowId, { focused: true });
             }
          });
       } else {
          fallbackReturn(targets);
       }
    });
  }
});

// Bước 2: Hàm cứu cánh nếu không tìm thấy tab cũ
function fallbackReturn(targets) {
   chrome.tabs.query({}, (tabs) => {
      let found = false;
      for (let tab of tabs) {
         if (!tab.url) continue;
         for (let target of targets) {
            if (checkMatch(tab.url, target.url, target.mode)) {
               chrome.tabs.update(tab.id, { active: true });
               chrome.windows.update(tab.windowId, { focused: true });
               found = true;
               break;
            }
         }
         if (found) break;
      }
      
      // Nếu lỡ đóng sạch mọi tab an toàn -> Mở tab mới với chính link cuối cùng đã xem
      if (!found) {
          let urlToOpen = lastActiveSafeUrl || targets[0].url; // Ưu tiên link cuối cùng, hoặc lấy link thiết lập
          let finalUrl = urlToOpen.startsWith('http') ? urlToOpen : 'https://' + urlToOpen;
          chrome.tabs.create({ url: finalUrl });
      }
   });
}