chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "modifyDOM") {
      modifyDOM();
    }
  });

  function modifyWords(paragraphs) {

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const text = paragraph.textContent.trim().split(" ");
      const modifiedWords = [];

      let newParagraph = '';
      text.forEach(function (item) {
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

        newParagraph += boldWord + ' ';

      });
      paragraph.innerHTML = newParagraph;
      
    }
  }
  
  function modifyDOM() {
    
    const paragraphs = document.getElementsByTagName('p');

    modifyWords(paragraphs);

}

document.addEventListener('DOMContentLoaded', modifyDOM);
