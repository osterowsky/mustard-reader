chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "modifyDOM") {
      modifyDOM();
    }
  });

  function modifyDOM() {
    
    const paragraphs = document.getElementsByTagName('p');
    modifyElementsContent(paragraphs);

  }

  function modifyElementsContent(elements) {

    const modifiedContent = [];

    for (let i = 0, len = elements.length; i < len; i++) {
      const element = elements[i];

      // Check if element has <noscript> child
      if (checkChildren(element)) {
        continue;
      }

      const elementContent = element.textContent.trim().split(" ");
      let newElementContent = modifyWords(elementContent);
      modifiedContent.push(newElementContent)
      
    }

    for (let i = 0, len = elements.length; i < len; i++) {
      elements[i].innerHTML = modifiedContent[i];
    }

  }

  function checkChildren(element) {
    return Array.from(element.children).some(child => child.tagName.toLowerCase() === 'noscript');
  }

  function modifyWords(element) {
    let newElement = '';

    element.forEach(function (item) {
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
      
      newElement += boldWord + ' ';
    });

    return newElement
  }
