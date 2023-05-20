let turboVueEnabled = false;
let modifiedTextNodes = [];
let observer = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
  if (message.action === "toggleTurboVue") {
      turboVueEnabled = !turboVueEnabled

      if (turboVueEnabled) {
        modifyDOM();
        observer = observeDOMChanges();
      } else {
        disconnectObserver();
        restoreDOM();
      }

    }
  });

  function observeDOMChanges() {
    let observer = new MutationObserver(mutations => {
      console.log("DOM modified");
      disconnectObserver();
    })
    const config = {
      childList: true,
      subtree: true,
    };

    observer.observe(document.body, config)
    return observer;
  }

  function disconnectObserver() {
    if (observer) {
      console.log("disconnect")
      observer.disconnect();
      observer = null;
    }
  }

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
    if (node.nodeType === 3 && node.textContent.trim().length != 0) {
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
      for (const childNode of node.childNodes) {
        modifyTextNodes(childNode);
      }
    }

  }

  function restoreDOM() {
    for (const { parent, node, span } of modifiedTextNodes) {
      if (parent.contains(span)) {
        parent.replaceChild(node, span);
      }
    }  

    modifiedTextNodes = [];
  } 

  // Section to validate translated elements.
  // ----

  function checkAncestors(node) {
    const tags = new Set(["code", "noscript", "pre", "cite", "script", "nav", "header", "footer", "q", "strong", "style", "tfoot", "thead", "svg", "i", "button", "h1", "h2", "input", "abbr", "address", "blockquote", "img"])
    let ancestor = node.parentNode;

    while (ancestor !== null) {
      const tagName = ancestor.tagName ? ancestor.tagName.toLowerCase() : null;
      if (tags.has(tagName)) {
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
    for (const item of textNode) {
      let boldWord = modifyWord(item);
      modifiedText += boldWord + ' ';
    }

    return modifiedText;
  }

  function modifyWord(item) {
    let boldWord = substractNonAlpha(item);
    if (boldWord) {
      item = item.substr(boldWord.length);
    }
  
    if (item.length == 1) {
      return item;
    } else if (item.length == 2) {
      boldWord += `<span style="font-weight: 700;">${item}</span>`;
    } else if (item.length == 3) {
      boldWord += `<span style="font-weight: 400;">${item[0]}</span><span style="font-weight: 700;">${item[1]}</span><span style="font-weight: 400;">${item[2]}</span>`;
    } else if (item.length >= 4) {
      const firstQuarter = Math.floor(item.length / 4);
      const secondQuarter = Math.ceil(item.length / 2);
      const thirdQuarter = Math.ceil((item.length * 3) / 4);

      const firstPart = item.substr(0, firstQuarter);
      const secondPart = item.substr(firstQuarter, secondQuarter - firstQuarter);
      const thirdPart = item.substr(secondQuarter, thirdQuarter - secondQuarter);
      const fourthPart = item.substr(thirdQuarter);

      boldWord += `<span style="font-weight: 700;">${firstPart}</span><span style="font-weight: 400;">${secondPart}</span><span style="font-weight: 700;">${thirdPart}</span><span style="font-weight: 400;">${fourthPart}</span>`;
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

  /* function modifyWord2(item) {

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
*/