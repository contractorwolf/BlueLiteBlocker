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


function filterPromoted(jsonObject) {
    try {
      // Access the "TimelineAddEntries" instruction using optional chaining
      const instructions = jsonObject.data?.home?.home_timeline_urt?.instructions;
  
      if (instructions) {
  
          // maybe find index here so that you can get the put the filtered entries back in the right place
        const instructionsIndex = instructions.findIndex(
          (instruction) => instruction.type === 'TimelineAddEntries'
        );
  
        if (instructionsIndex > -1 && instructions[instructionsIndex].entries) {
          console.log(
            'filterPromoted from total: ',
            instructions[instructionsIndex].entries.length
          );
  
          // filter out the promoted tweets
          const filteredEntries = instructions[instructionsIndex].entries.filter(entry => {
              return !entry.entryId.startsWith('promoted-tweet-');
          });
  
          instructions[instructionsIndex].entries = filteredEntries;
  
          jsonObject.data.home.home_timeline_urt.instructions = instructions;
  
        } else {
          console.log('No "TimelineAddEntries" instruction found.');
        }
      } else {
        console.log('The specified path to entries not found.');
      }
    } catch (error) {
      console.error('Error reading the JSON file:', error);
    }
  
    return jsonObject;
  }
  
  function getUserList(jsonObject) {
    let users = [];

    try {
      // Access the "TimelineAddEntries" instruction using optional chaining
      const instructions = jsonObject.data?.home?.home_timeline_urt?.instructions;
  
      if (instructions) {
  
          // maybe find index here so that you can get the put the filtered entries back in the right place
        const instructionsIndex = instructions.findIndex(
          (instruction) => instruction.type === 'TimelineAddEntries'
        );
  
        if (instructionsIndex > -1 && instructions[instructionsIndex].entries) {
          console.log(
            'getUserList from: ',
            instructions[instructionsIndex].entries.length
          );

          // just get the tweet 
          const tweetEntries = instructions[instructionsIndex].entries.filter(entry => {
              const entryId = entry.entryId;
  
              return entryId.startsWith('tweet-');
          });

          console.log(
            'tweets: ',
            tweetEntries.length
          );
          
          // extract the user data
          users = tweetEntries.map(entry => {
              //console.log(entry.entryId);
  
              const user = entry.content.itemContent.tweet_results.result.core.user_results.result;
              const urlData = user.legacy.entities.url?.urls[0];
              
              return {
                  rest_id: user.rest_id,
                  has_graduated_access: user.has_graduated_access,
                  is_blue_verified: user.is_blue_verified,
                  following: user.legacy.following,
                  created_at: user.legacy.created_at,
                  description: user.legacy.description,
                  display_url: urlData?.display_url,
                  expanded_url: urlData?.expanded_url,
                  url: urlData?.url,
                  followers_count: user.legacy.followers_count,
                  friends_count: user.legacy.friends_count,
                  location: user.legacy.location,
                  media_count: user.legacy.media_count,
                  name: user.legacy.name,
                  normal_followers_count: user.legacy.normal_followers_count,
                  profile_image_url_https: user.legacy.profile_image_url_https,
                  screen_name: user.legacy.screen_name,
                  statuses_count: user.legacy.statuses_count,
                  verified: user.legacy.verified
              };
          });
          

        } else {
          console.log('No "TimelineAddEntries" instruction found.');
        }
      } else {
        console.log('The specified path to entries not found.');
      }
    } catch (error) {
      console.error('Error reading the JSON file:', error);
    }
  
    return users;
  }



// overwrite the getter and setter of XMLHttpRequest.responseText to modify responses (surely there's a better way?)
function set_response_hook(xhr, timeline_type) {
    function getter() {
        delete xhr.responseText;
        let xhr_response = xhr.responseText;

        try {
            let json = JSON.parse(xhr_response);
            console.log(timeline_type);
            //console.log(JSON.stringify(json));
            //parse_timeline(timeline_type, json);

            const filtered = filterPromoted(json);

            const users = getUserList(filtered);

            console.log(JSON.stringify(users, false, 2));  

            xhr_response = JSON.stringify(filtered);
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
