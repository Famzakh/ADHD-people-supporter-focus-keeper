if (!document.getElementById('focus-adhd-warning')) {
  chrome.storage.local.get(['isAppOn', 'isSoundOn'], (result) => {
    
    if (result.isAppOn === false) return;

    const overlay = document.createElement('div');
    overlay.id = 'focus-adhd-warning';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(231, 76, 60, 0.96)';
    overlay.style.color = 'white';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.fontFamily = 'Arial, sans-serif';

    const message = document.createElement('h1');
    message.innerText = 'You are losing focus!';
    message.style.fontSize = '45px';
    message.style.margin = '0 0 20px 0';

    const subMessage = document.createElement('p');
    subMessage.innerText = 'Please close this tab or return to your allowed study websites.';
    subMessage.style.fontSize = '22px';
    subMessage.style.margin = '0 0 40px 0';

    const closeBtn = document.createElement('button');
    closeBtn.innerText = "I'll go back!";
    closeBtn.style.padding = '15px 35px';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.backgroundColor = 'white';
    closeBtn.style.color = '#e74c3c';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';

    overlay.appendChild(message);
    overlay.appendChild(subMessage);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    let audio = null;
    if (result.isSoundOn) {
      try {
        const audioUrl = chrome.runtime.getURL('ting.mp3');
        audio = new Audio(audioUrl);
        audio.play().catch(e => console.log('Audio playback locked:', e));
      } catch(e) {}
    }

    closeBtn.addEventListener('click', () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      overlay.remove();
      chrome.runtime.sendMessage({ action: "returnToTarget" });
    });
  });
}