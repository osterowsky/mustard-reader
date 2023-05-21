document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const toggleText = document.getElementById('toggleText');

    toggleText.textContent = 'Turn us on';
  
    toggleButton.addEventListener('change', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: "toggleTurboVue" });
        toggleText.textContent = toggleButton.checked ? 'Turn us off' : 'Turn us on';
      });
    });
  });
  