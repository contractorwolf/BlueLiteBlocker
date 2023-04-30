// Import the required modules
import fs from 'fs/promises';

// Function to read JSON file, find the entries and output their count
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
          const tweetEntries = instructions[instructionsIndex].entries.filter(entry => entry.entryId?.startsWith('tweet-'));

          console.log('tweets: ', tweetEntries.length);
          
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


// Specify the JSON file path
const jsonFilePath = './timeline.json';
// pull data out as string
const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
// convert string to json
const jsonData = JSON.parse(fileContent);

// Call the function to read the file and output the count of entries
const filteredRecords = filterPromoted(jsonData);
const users = getUserList(filteredRecords);

//console.log(JSON.stringify(users, false, 2));  

// {
//     "data":{
//        "home":{
//           "home_timeline_urt":{
//              "instructions":[
//                 {
//                    "type":"TimelineAddEntries",
//                    "entries":[
//                       {
//                          "entryId":"tweet-1652096609499373568",





        //1 filter out the promoted tweets
        // "entryId":"promoted-tweet-



        // {
        //     "entryId":"tweet-1652096609499373568",
        //     "content":{
        //        "entryType":"TimelineTimelineItem",
        //        "itemContent":{
        //           "itemType":"TimelineTweet",
        //           "tweet_results":{
        //              "result":{
        //                 "__typename":"Tweet",
        //                 "core":{
        //                    "user_results":{
        //                       "result":{
        //                          "__typename":"User",
        //                          "rest_id":"14437914",
        //                          "has_graduated_access":true,
        //                          "is_blue_verified":true,
        //                          "profile_image_shape":"Circle",
        //                          "legacy":{
        //                             "following":true,
        //                             "can_dm":false,
        //                             "can_media_tag":true,
        //                             "created_at":"Fri Apr 18 21:57:17 +0000 2008",
        //                             "default_profile":false,
        //                             "default_profile_image":false,
        //                             "description":"PBS NewsHour is one of the most trusted news programs on TV and online.",
        //                             "entities":{
        //                                "url":{
        //                                   "urls":[
        //                                      {
        //                                         "display_url":"pbs.org/newshour/",
        //                                         "expanded_url":"https://www.pbs.org/newshour/",
        //                                         "url":"https://t.co/Qa9AP1WmPb",
        //                                      }
        //                                   ]
        //                                }
        //                             },
        //                             "followers_count":1203923,
        //                             "friends_count":87849,
        //                             "location":"Arlington, VA",
        //                             "media_count":27291,
        //                             "name":"PBS NewsHour",
        //                             "normal_followers_count":1203923,
        //                             "profile_image_url_https":"https://pbs.twimg.com/profile_images/875456540450443265/W5yKx8um_normal.jpg",
        //                             "screen_name":"NewsHour",
        //                             "statuses_count":226272,
        //                             "verified":false,






// {
//     "entryId":"promoted-tweet-1651696575226474496-25214d403e582b90",
//     "content":{
//        "entryType":"TimelineTimelineItem",
//        "itemContent":{
//           "itemType":"TimelineTweet",
//           "tweet_results":{
//              "result":{
//                 "__typename":"Tweet",
//                 "core":{
//                    "user_results":{
//                       "result":{
//                          "__typename":"User",
//                          "id":"VXNlcjoyNjQwMDM1MTU=",
//                          "rest_id":"264003515",
//                          "has_graduated_access":true,
//                          "is_blue_verified":false,
//                          "profile_image_shape":"Square",
//                          "legacy":{
//                             "created_at":"Fri Mar 11 04:20:30 +0000 2011",
//                             "description":"The finance company that's helping members get their money right. Bank, borrow, and invest — all in one app. NMLS #1121636 \n\nQuestions: @SoFiSupport",
//                             "entities":{
//                                "url":{
//                                   "urls":[
//                                      {
//                                         "display_url":"us.sofi.com/draftlab_tw",
//                                         "expanded_url":"http://us.sofi.com/draftlab_tw",
//                                         "url":"https://t.co/XCeecOdcA2",
//                                      }
//                                   ]
//                                }
//                             },
//                             "fast_followers_count":0,
//                             "favourites_count":12671,
//                             "followers_count":146762,
//                             "friends_count":1081,
//                             "has_custom_timelines":true,
//                             "is_translator":false,
//                             "listed_count":901,
//                             "location":"San Francisco, CA",
//                             "media_count":2981,
//                             "name":"SoFi",
//                             "normal_followers_count":146762,
//                             "profile_banner_url":"https://pbs.twimg.com/profile_banners/264003515/1659716181",
//                             "profile_image_url_https":"https://pbs.twimg.com/profile_images/1411014292791382016/LqQG6oZd_normal.jpg",
//                             "profile_interstitial_type":"",
//                             "screen_name":"SoFi",
//                             "name":"SoFi",
//                             "normal_followers_count":146762,
//                             "profile_banner_url":"https://pbs.twimg.com/profile_banners/264003515/1659716181",
//                             "profile_image_url_https":"https://pbs.twimg.com/profile_images/1411014292791382016/LqQG6oZd_normal.jpg",
//                             "screen_name":"SoFi",
//                             "url":"https://t.co/XCeecOdcA2",
//                             "verified":false,
//                             "verified_type":"Business",




// "rest_id":"14437914",
// "has_graduated_access":true,
// "is_blue_verified":true,
// "following":true,
// "created_at":"Fri Apr 18 21:57:17 +0000 2008",
// "description":"PBS NewsHour is one of the most trusted news programs on TV and online.",
// "display_url":"pbs.org/newshour/",
// "expanded_url":"https://www.pbs.org/newshour/",
// "url":"https://t.co/Qa9AP1WmPb",
// "followers_count":1203923,
// "friends_count":87849,
// "location":"Arlington, VA",
// "media_count":27291,
// "name":"PBS NewsHour",
// "normal_followers_count":1203923,
// "profile_image_url_https":"https://pbs.twimg.com/profile_images/875456540450443265/W5yKx8um_normal.jpg",
// "profile_banner_url":"https://pbs.twimg.com/profile_banners/264003515/1659716181",
// "profile_image_url_https":"https://pbs.twimg.com/profile_images/1411014292791382016/LqQG6oZd_normal.jpg",
// "screen_name":"NewsHour",
// "statuses_count":226272,
// "verified":false,





{
    "entryId":"tweet-1652376463297871873",
    "content":{
       "entryType":"TimelineTimelineItem",
       "itemContent":{
          "itemType":"TimelineTweet",
          "tweet_results":{
             "result":{
                "__typename":"TweetWithVisibilityResults",
                "tweet":{
                   "rest_id":"1652376463297871873",
                   "core":{
                      "user_results":{
                         "result":{
                            "__typename":"User",
                            "rest_id":"21962767",
                            "has_graduated_access":true,
                            "is_blue_verified":false,
                            "profile_image_shape":"Circle",
                            "legacy":{
                               "following":true,
                               "can_dm":true,
                               "can_media_tag":true,
                               "created_at":"Thu Feb 26 03:10:42 +0000 2009",
                               "default_profile":false,
                               "default_profile_image":false,
                               "description":"“Comedian”",
                               "entities":{
                                    {
                                     "urls":[
                                        {
                                           "display_url":"Linktree.com/waltermasterson",
                                           "expanded_url":"http://Linktree.com/waltermasterson",
                                           "url":"https://t.co/kTHix2UKl1",
                                           "indices":[
                                              0,
                                              23
                                           ]
                                        }
                                     ]
                                  }
                               },
                               "fast_followers_count":0,
                               "favourites_count":15378,
                               "followers_count":201540,
                               "friends_count":3811,
                               "has_custom_timelines":true,
                               "is_translator":false,
                               "listed_count":643,
                               "location":"New York, NY",
                               "media_count":3310,
                               "name":"Walter Masterson",
                               "normal_followers_count":201540,
                               "possibly_sensitive":false,
                               "profile_banner_url":"https://pbs.twimg.com/profile_banners/21962767/1660857722",
                               "profile_image_url_https":"https://pbs.twimg.com/profile_images/1486394076421369866/SHwajLAc_normal.jpg",
                               "profile_interstitial_type":"",
                               "screen_name":"waltermasterson",
                               "statuses_count":22728,
                               "translator_type":"none",
                               "url":"https://t.co/kTHix2UKl1",
                               "verified":false,
                               "want_retweets":true,
                               "withheld_in_countries"\