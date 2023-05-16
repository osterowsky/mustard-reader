chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "modifyDOM") {
      modifyDOM();
    }
  });

  function modifyWords(element) {
    let newElement = '';

    element.forEach(function (item) {
      // Change of word to be bold as accouring to bionic reading method
      let boldWord = '';
    
      if (item.length == 1) {
        boldWord += `<b>${item}</b>`;
      }
      else if (item.length <= 3 && item.length != 1) {
        boldWord += `<b>${item.substr(0, 1)}</b><span style="font-weight: 400;">${item.substr(1)}</span>`;
      }
      else if (item.length > 3 && (item.length % 2 == 0)) {
        boldWord += `<b>${item.substr(0, item.length / 2)}</b><span style="font-weight: 400;">${item.substr(item.length / 2)}</span>`;
      } else {
        boldWord += `<b>${item.substr(0, item.length / 2 + 1)}</b><span style="font-weight: 400;">${item.substr(item.length / 2 + 1)}</span>`;
      }

      newElement += boldWord + ' ';
    });

    return newElement
  }

  function modifyElementsContent(elements) {

    for (var i = elements.length; i--;) {
      const element = elements[i];
      const text = element.textContent.trim().split(" ");

      newElementContent = modifyWords(element)

      element.innerHTML = newElementContent;
      
    }
  }
  
  function modifyDOM() {
    
    const paragraphs = document.getElementsByTagName('p');
    modifyElementsContent(paragraphs);

}

document.addEventListener('DOMContentLoaded', modifyDOM);
