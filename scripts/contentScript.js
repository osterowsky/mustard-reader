let turboVueEnabled = false;
let originalContent = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleTurboVue") {
      turboVueEnabled = !turboVueEnabled

      if (turboVueEnabled) {
        modifyDOM();
      } else {
        restoreDOM();
      }

    }
  });

  function modifyDOM() {
    
    if (!originalContent) {
      originalContent = document.body.innerHTML
    }

    modifyTextNodes(document.body);

  }

  function modifyTextNodes(node) {

    // Check if nodeType is textNode
    if (node.nodeType === 3) {
      const modifiedText = modifyWords(node.textContent.trim().split(" "));
      const span = document.createElement('span');
      span.innerHTML = modifiedText;
      node.parentNode.replaceChild(span, node);

    } else {
      node.childNodes.forEach(function(childNode) {
        modifyTextNodes(childNode);
      });
    }

  }

  function modifyWords(textNode) {

    // If text consists just one word, does not make sense to change it
    if (textNode.length == 1) {
      return textNode
    }

    let modifiedText = '';
    textNode.forEach(function (item) {
      let boldWord = '';
    
      if (item.length == 1) {
        boldWord += `<span style="font-weight: 700;">${item}</span>`;

      } else if (item.length <= 3 && item.length != 1) {
        boldWord += `<span style="font-weight: 700;">${item.substr(0, 1)}</span><span style="font-weight: 400;">${item.substr(1)}</span>`;

      } else if (item.length > 3 && (item.length % 2 == 0)) {
        boldWord += `<span style="font-weight: 700;">${item.substr(0, item.length / 2)}</span><span style="font-weight: 400;">${item.substr(item.length / 2)}</span>`;

      } else {
        boldWord += `<span style="font-weight: 700;">${item.substr(0, item.length / 2 + 1)}</span><span style="font-weight: 400;">${item.substr(item.length / 2 + 1)}</span>`;

      }
      
      modifiedText += boldWord + ' ';
    });

    return modifiedText;
  }


  function restoreDOM() {
    if (originalContent) {
      document.body.innerHTML = originalContent;
      originalContent = null;
    }
  } 