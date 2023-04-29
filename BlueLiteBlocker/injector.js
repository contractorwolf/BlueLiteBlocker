// install extension
async function install_extension() {
    let s = document.createElement('script');
    s.type = "text/javascript";
    s.async = false;
    s.src = chrome.runtime.getURL('xhr_hook.js');
    document.documentElement.appendChild(s);
    s.onload = function() {
        this.remove();
    };
}

install_extension()
.then(response => console.log('done loading'));