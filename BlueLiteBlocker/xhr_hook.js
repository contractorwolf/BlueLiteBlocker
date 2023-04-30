console.log("BlueLiteBlocker: loaded ext");

//const homeLatestTimelineRegex = /https:\/\/twitter.com\/i\/api\/graphql\/(.+?)\/HomeLatestTimeline(?:\?.*)?/;
const homeLatestTimelineRegex = /https:\/\/twitter.com\/i\/api\/graphql\/(.+?)\/Home(?:Latest)?Timeline(?:\?.*)?/;
//                               https://twitter.com/i/api/graphql/7JUXeanO9cYvjKvaPe7EMg/HomeTimeline?variables=%7B%22count%22%3A20%2C%22includePromotedContent%22%3Atrue%2C%22latestControlAvailable%22%3Atrue%2C%22requestContext%22%3A%22launch%22%2C%22withCommunity%22%3Atrue%7D&features=%7B%22blue_business_profile_image_shape_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22vibe_api_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Afalse%2C%22interactive_text_enabled%22%3Atrue%2C%22responsive_web_text_conversations_enabled%22%3Afalse%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D


const port = chrome.runtime.connect({name: 'contentScript'});



// Listen for messages from the popup script
port.onMessage.addListener((message) => {
  console.log(message.greeting);
});




// hook XMLHttpRequest.open to filter API responses and remove any blue check tweets
let old_xml_open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
    if (arguments.length >= 2 && arguments[0] !== "") {
        const method = arguments[0].toUpperCase();
        const url = arguments[1];

        if(!!url.match(homeLatestTimelineRegex)){
            console.log(`MATCHED method: ${method} url: ${url}`);
            if (!this._xhr_response_hooked) {
                this._xhr_response_hooked = true;
                set_response_hook(this, 'timeline');
            }
        }
    }
    old_xml_open.apply(this, arguments);
}

const filterPromoted = (jsonObject) => {
    // if the correct entries node exists, filter out all the promoted tweets
    try {
        // Access the "TimelineAddEntries" instruction using optional chaining
        const instructions = jsonObject.data?.home?.home_timeline_urt?.instructions;

        if (instructions) {
            // find index here to put the filtered entries back in the right place
            const instructionsIndex = instructions.findIndex((instruction) => instruction.type === 'TimelineAddEntries');

            if (instructionsIndex > -1 && instructions[instructionsIndex].entries) {

                const startingCount = instructions[instructionsIndex].entries.length;
                console.log('starting entities: ', startingCount);

                // filter out the promoted tweets
                const filteredEntries = instructions[instructionsIndex].entries.filter(entry => !entry.entryId.startsWith('promoted-tweet-'));

                instructions[instructionsIndex].entries = filteredEntries;

                console.log('resulting entities: ', filteredEntries.length);
                console.log(`removed: ${startingCount - filteredEntries.length} promoted tweets.`);

                jsonObject.data.home.home_timeline_urt.instructions = instructions;

            } else {
                console.log('TimelineAddEntries instruction not found');
            }
        } else {
        console.log('instructions not found.');
        }
    } catch (error) {
        console.error('Error reading the JSON:', error);
    }

    return jsonObject;
}

const getUserList = (jsonObject) => {
    let users = [];

    try {
      // Access the "TimelineAddEntries" instruction using optional chaining
      const instructions = jsonObject.data?.home?.home_timeline_urt?.instructions;
  
      if (instructions) {
          // maybe find index here so that you can get the put the filtered entries back in the right place
        const instructionsIndex = instructions.findIndex((instruction) => instruction.type === 'TimelineAddEntries');
  
        if (instructionsIndex > -1 && instructions[instructionsIndex].entries) {
          console.log('getUserList from: ', instructions[instructionsIndex].entries.length);

          // just get the tweet 
          const tweetEntries = instructions[instructionsIndex].entries
                .filter(entry => entry.entryId?.startsWith('tweet-') || entry.entryId?.startsWith('promoted-tweet-'));

          console.log('users: ', tweetEntries.length);
          
          // extract the user data
          users = tweetEntries.map(entry => {
              //console.log(entry.entryId);
              const tweet_result = entry.content.itemContent.tweet_results.result;

              let user;
              if (tweet_result && tweet_result?.__typename == "Tweet") {
                    //  "result":{
                    //     "__typename":"Tweet",
                    //     "core":{
                    //        "user_results":{
                    //           "result":{
                    //              "__typename":"User",
                user = tweet_result.core?.user_results.result;
              } else if (tweet_result?.__typename == "TweetWithVisibilityResults") {
                    // "result":{
                    //    "__typename":"TweetWithVisibilityResults",
                    //    "tweet":{
                    //       "rest_id":"1652376463297871873",
                    //       "core":{
                    //          "user_results":{
                    //             "result":{
                    //                "__typename":"User",
                user = tweet_result.tweet?.core?.user_results.result;
              } else {
                    //{
                    // "entryId":"tweet-1652391677435453441",
                    // "content":{
                    //    "itemContent":{
                    //       "tweet_results":{
                    //          "result":{
                    //             "__typename":"Tweet",
                    //             "rest_id":"1652391677435453441",
                    //             "core":{
                    //                "user_results":{
                    //                   "result":{
                    //                      "__typename":"User",
                    //                      "id":"VXNlcjo5NDU4MTcxMzU4MTY2NTQ4NDg=",
                    //                      "rest_id":"945817135816654848",
                    //                      "has_graduated_access":true,
                    //                      "is_blue_verified":true,
                    //                      "profile_image_shape":"Circle",
                    //                      "legacy":{
                console.log(`------ UNKNOWN RESULT TYPE: ${JSON.stringify(tweet_result)}`);
              }
              
              if (user == null) console.log(`---core: ${JSON.stringify(entry)}`);

              const urlData = user.legacy?.entities?.url?.urls[0];
              
              return {
                  type: entry.entryId,
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
            //console.log(timeline_type);

            const users = getUserList(json);

            console.log(JSON.stringify(users, false, 2));  

            // Send a message from the content script to the popup script
            port.postMessage({ users });

            const filtered = filterPromoted(json);

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
