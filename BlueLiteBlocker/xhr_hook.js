console.log("BlueLiteBlocker: loaded ext");

const homeLatestTimelineRegex = /https:\/\/twitter.com\/i\/api\/graphql\/(.+?)\/HomeLatestTimeline(?:\?.*)?/;

// hook XMLHttpRequest.open to filter API responses and remove any blue check tweets
let old_xml_open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
    console.log(`--------------BlueLiteBlocker: open ${arguments[0]} ${arguments[1]}`);


    if (arguments.length >= 2 && arguments[0] !== "") {
        const method = arguments[0].toUpperCase();
        const url = arguments[1];

        if(!!url.match(homeLatestTimelineRegex)){
            console.log(`method: ${method} url: ${url}`);
            if (!this._xhr_response_hooked) {
                this._xhr_response_hooked = true;
                set_response_hook(this, 'timeline');
            }
        }
    }
    old_xml_open.apply(this, arguments);
}

function isTwitterHomeTimeline(url){
    const match = url.match(homeLatestTimelineRegex);

    if (match) return true;

    return false;
}

// overwrite the getter and setter of XMLHttpRequest.responseText to modify responses (surely there's a better way?)
function set_response_hook(xhr, timeline_type) {
    function getter() {
        delete xhr.responseText;
        let xhr_response = xhr.responseText;

        try {
            let json = JSON.parse(xhr_response);
            console.log(timeline_type);
            console.log(JSON.stringify(json));
            //parse_timeline(timeline_type, json);
            xhr_response = JSON.stringify(json);
        }catch (e) {
            log_exception(e);
        }

        setup();
        return xhr_response;
    }

    function setter(str) {
        this._var = str;
    }

    function setup() {
        Object.defineProperty(xhr, 'responseText', {
            _var: '',
            get: getter,
            set: setter,
            configurable: true
        });
    }
    setup();
}
