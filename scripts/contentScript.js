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
      if (parent.contains(span)) {
        parent.replaceChild(node, span);
      }
    });
    modifiedTextNodes = [];

    modifyTextNodes(document.body);

  }

  function modifyTextNodes(node) {

    // Check if nodeType is textNode.
    if (node.nodeType === 3) {
      if (!checkAncestors(node)) {
        return;
      }

      const modifiedText = modifyWords(node.textContent.trim().split(" "));
      const span = document.createElement('span');
      span.innerHTML = modifiedText;

      const parent = node.parentNode;
      if (parent.contains(node)) {
        parent.replaceChild(span, node);
      }
      modifiedTextNodes.push({ parent, node, span });
      
    } else {
      node.childNodes.forEach(function(childNode) {
        modifyTextNodes(childNode);

      });
    }

  }

  function restoreDOM() {
    modifiedTextNodes.forEach(({ parent, node, span }) => {
      if (parent.contains(span)) {
        parent.replaceChild(node, span);
      }
    });

    modifiedTextNodes = [];
  } 

  // Section to validate translated elements.
  // ----

  function checkAncestors(node) {
    const tags = ["code", "noscript", "pre", "h1", "h2"]
    let ancestor = node.parentNode;

    while (ancestor !== null) {
      const tagName = ancestor.tagName ? ancestor.tagName.toLowerCase() : null;
      if (tags.includes(tagName)) {
        return false; // Skip text nodes inside tags that shouldn't be modified
      }

      ancestor = ancestor.parentNode;
    }
    
    return true;
  }

  // Words modifications algorithms.
  // ----

  function modifyWords(textNode) {
    let modifiedText = '';
    textNode.forEach(function (item) {
      let boldWord = modifyWord(item)

      modifiedText += boldWord + ' ';
    });

    return modifiedText;
  }

function modifyWord(item) {

    // We subsract beggining if it is not alphanumeric.
    let boldWord = substractNonAlpha(item);
    if (boldWord) {
      item = item.substr(boldWord.length)
    }

    if (item.length == 1) {
      boldWord += `<span style="font-weight: 600;">${item}</span>`;

    } else if (item.length <= 3 && item.length != 1) {
      boldWord += `<span style="font-weight: 600;">${item.substr(0, 1)}</span><span style="font-weight: 400;">${item.substr(1)}</span>`;

    } else if (item.length > 3 && (item.length % 2 == 0)) {
      boldWord += `<span style="font-weight: 600;">${item.substr(0, item.length / 2)}</span><span style="font-weight: 400;">${item.substr(item.length / 2)}</span>`;

    } else {
      boldWord += `<span style="font-weight: 600;">${item.substr(0, item.length / 2)}</span><span style="font-weight: 400;">${item.substr(item.length / 2)}</span>`;
    }

    return boldWord;
  }


  function substractNonAlpha(item) {

    // Regex expression to match any non Unicode number or non Unicode letter.
    const nonAlphanumericRegex = /^[^\p{L}\p{N}]+/u;
    const match = item.match(nonAlphanumericRegex);
    if (match) {
      return match[0];
    } else {
      return '';
    }
  }