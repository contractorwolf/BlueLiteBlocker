// popup.js

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id, {name: 'popup'});
  
    // Send a message from the popup script to the content script
    //port.postMessage({greeting: 'Hello from the popup script!'});
  
    // Listen for messages from the content script
    port.onMessage.addListener((message) => {
      console.log(message);
    });
});
  