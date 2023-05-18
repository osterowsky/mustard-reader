let turboVueEnabled = false;
let modifiedTextNodes = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
  if (message.action === "toggleTurboVue") {
      turboVueEnabled = !turboVueEnabled

      if (turboVueEnabled) {
        modifyDOM();
        document.addEventListener("scroll", modifyDOM);
        document.addEventListener("click", modifyDOM);

      } else {
        restoreDOM();
        document.removeEventListener("scroll", modifyDOM);
        document.removeEventListener("click", modifyDOM);      
      }

    }
  });

  function modifyDOM() {

    // Restore to previous state and reiterate over again in case, when DOM changes.
    modifiedTextNodes.forEach(({ parent, node, span }) => {
        parent.replaceChild(node, span);
    });
    modifiedTextNodes = [];

    modifyTextNodes(document.body);

  }

  function modifyTextNodes(node) {

    // Check if nodeType is textNode.
    if (node.nodeType === 3) {
      if (!checkParentNode(node)) {
        return;
      }

      const modifiedText = modifyWords(node.textContent.trim().split(" "));
      const span = document.createElement('span');
      span.innerHTML = modifiedText;

      const parent = node.parentNode;
      parent.replaceChild(span, node);
      modifiedTextNodes.push({ parent, node, span });
      
    } else {
      node.childNodes.forEach(function(childNode) {
        modifyTextNodes(childNode);

      });
    }

  }

  function modifyWords(textNode) {

    // If text consists just one word, does not make sense to change it, because in some cases it produces bugs. 
    if (textNode.length == 1) {
      return textNode
    }

    let modifiedText = '';
    textNode.forEach(function (item) {
      let boldWord = '';
    
      if (item.length == 1) {
        boldWord += `<span style="font-weight: 600;">${item}</span>`;

      } else if (item.length <= 3 && item.length != 1) {
        boldWord += `<span style="font-weight: 600;">${item.substr(0, 1)}</span><span style="font-weight: 400;">${item.substr(1)}</span>`;

      } else if (item.length > 3 && (item.length % 2 == 0)) {
        boldWord += `<span style="font-weight: 600;">${item.substr(0, item.length / 2)}</span><span style="font-weight: 400;">${item.substr(item.length / 2)}</span>`;

      } else {
        boldWord += `<span style="font-weight: 600;">${item.substr(0, item.length / 2 + 1)}</span><span style="font-weight: 400;">${item.substr(item.length / 2 + 1)}</span>`;

      }
      
      modifiedText += boldWord + ' ';
    });

    return modifiedText;
  }


  function restoreDOM() {
    modifiedTextNodes.forEach(({ parent, node, span }) => {
      parent.replaceChild(node, span);
    });

    modifiedTextNodes = [];
  } 

  function checkParentNode(node) {
    const parentNode = node.parentNode.tagName.toLowerCase();
    if (parentNode === 'code' || parentNode === 'noscript') {
      return false; // Skip text nodes inside <code> or <noscript>.
    }

    return true;
  }