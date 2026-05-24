document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('targetsContainer');
  const addLinkBtn = document.getElementById('addLinkBtn');
  const masterToggle = document.getElementById('masterToggle');
  const masterText = document.getElementById('masterText');
  const masterBox = document.getElementById('masterBox');
  const soundToggle = document.getElementById('soundToggle');
  const saveBtn = document.getElementById('saveBtn');

  let rowCounter = 0;

  function createTargetRow(url = '', mode = 'domain') {
    rowCounter++;
    const currentId = rowCounter;

    const row = document.createElement('div');
    row.className = 'target-row';
    row.innerHTML = `
      <div class="row-header">
        <span>Website Target</span>
        <button class="remove-btn" type="button">X</button>
      </div>
      <input type="text" class="row-url" value="${url}" placeholder="e.g. desmos.com/calculator">
      <div class="mode-container">
        <input type="radio" id="modeStrict_${currentId}" name="trackMode_${currentId}" value="strict" ${mode === 'strict' ? 'checked' : ''}>
        <label for="modeStrict_${currentId}">Strict URL (Exact page only)</label><br>
        
        <input type="radio" id="modeDomain_${currentId}" name="trackMode_${currentId}" value="domain" ${mode === 'domain' || mode === 'section' ? 'checked' : ''}>
        <label for="modeDomain_${currentId}">Domain Mode (Auto-extracts website root, allows all sub-pages)</label>
      </div>
    `;

    container.appendChild(row);
    row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  }

  chrome.storage.local.get(['focusTargets', 'isAppOn', 'isSoundOn'], (result) => {
    if (result.isSoundOn !== undefined) soundToggle.checked = result.isSoundOn;
    if (result.isAppOn !== undefined) {
      masterToggle.checked = result.isAppOn;
      updateMasterUI(result.isAppOn);
    }
    
    const savedTargets = result.focusTargets || [];
    if (savedTargets.length > 0) {
      savedTargets.forEach(t => createTargetRow(t.url, t.mode));
    } else {
      createTargetRow('', 'domain');
    }
  });

  addLinkBtn.addEventListener('click', () => createTargetRow('', 'domain'));

  masterToggle.addEventListener('change', () => updateMasterUI(masterToggle.checked));

  function updateMasterUI(isOn) {
    if (isOn) {
      masterText.innerText = "App is ON";
      masterBox.classList.remove('off');
    } else {
      masterText.innerText = "App is OFF";
      masterBox.classList.add('off');
    }
  }

  saveBtn.addEventListener('click', () => {
    const rows = container.querySelectorAll('.target-row');
    const focusTargets = [];

    rows.forEach(row => {
      const urlValue = row.querySelector('.row-url').value.trim();
      const checkedMode = row.querySelector('input[type="radio"]:checked').value;
      if (urlValue) {
        focusTargets.push({ url: urlValue, mode: checkedMode });
      }
    });

    const settings = {
      focusTargets: focusTargets,
      isAppOn: masterToggle.checked,
      isSoundOn: soundToggle.checked
    };

    chrome.storage.local.set(settings, () => {
      saveBtn.innerText = "Saved successfully!";
      saveBtn.style.backgroundColor = "#2980b9";
      setTimeout(() => { 
        saveBtn.innerText = "Save Settings"; 
        saveBtn.style.backgroundColor = "#27ae60";
      }, 1500);
    });
  });
});