var TwitterAPI = require('node-twitter-api');
var util = require('util');
var fs = require('fs');
var sleep = require('sleep');
//var rita = require('rita');

var counterBuffer = fs.readFileSync("counter.txt");
//turning into integer
var i = parseInt(counterBuffer.toString());
//var counter = parseInt(fs.readFileSync("counter.txt").toString());


// verifications and tokens
var secrets = JSON.parse(fs.readFileSync("../../__secrets/midday_train.secrets.json"));

var cKey = secrets["cKey"];
var cSecret = secrets["cSecret"];
var accessToken = secrets["accessToken"];
var tokenSecret = secrets["tokenSecret"];
var myScreenName = "midday_train"

// create a twitter API object
var twitter = new TwitterAPI({
    consumerKey: cKey,
    consumerSecret: cSecret});
    
// register onData() as handler for getStream() events
twitter.getStream("user", {}, accessToken, tokenSecret, onData);    

// parsing JSON file    
var citiesData = JSON.parse(fs.readFileSync("us_cities.json"));
var cities = citiesData["cities"];
var states = citiesData["state"];

var timer_secs = 60;
setInterval(tweet_names, timer_secs*1000);

function onData(error, streamEvent) {

	console.log('some event');

    // a few different cases.
    // case 1: if the object is empty, simply return
    if (Object.keys(streamEvent).length === 0) {
        return;
    }

    // "event" key present for favorites and new followers
    else if (streamEvent.hasOwnProperty('event')) {
        var sourceHandle = streamEvent['source']['screen_name'];
        // a new follower!
        if (streamEvent['event'] == 'follow') {
            console.log("followed by @" + sourceHandle);
            twitter.statuses(
                "update",
               {"status": "You are welcome to tag along, @" + sourceHandle + "!"},
               accessToken,
               tokenSecret,
               function (err, data, resp) { console.log(err); }
            );
        }
        else if (streamEvent['event'] == 'favorite') {
            var favoritedTweetId = streamEvent['target']['id_str'];
            var screenName = streamEvent['source']['screen_name'];
            console.log("tweet id ",
                    favoritedTweetId,
                    " favorited by @",
                    screenName);
            
            var MAX_DICE = 3;
            
            // a random int between [0 and MAX_DICE]
            var diceRoll = Math.floor(Math.random()*MAX_DICE);
            
            console.log("rolled fave: " + diceRoll.toString());
            
            if (diceRoll == 0) {
            	twitter.statuses(
             	   "update",
             	  {"status": cities[i - 1].city + ", " + cities[i - 1].state + " is a great place to visit, @" + screenName},
            	   accessToken,
             	  tokenSecret,
             	  function (err, data, resp) { console.log(err); }
            	); 
            } else if (diceRoll == 1) {
            	twitter.statuses(
             	   "update",
             	  {"status": cities[i - 1].city + ", " + cities[i - 1].state + " is rich in history, @" + screenName},
            	   accessToken,
             	  tokenSecret,
             	  function (err, data, resp) { console.log(err); }
            	); 
            } else if (diceRoll == 2) {
            	twitter.statuses(
             	   "update",
             	  {"status": "Can't wait to try " + cities[i - 1].city + "'s local cuisine, @" + screenName},
            	   accessToken,
             	  tokenSecret,
             	  function (err, data, resp) { console.log(err); }
            	); 
            } else {
            	console.log("dice error fave");
            }           
        }
    }

    // 'direct_message' key indicates this is an incoming direct message
    else if (streamEvent.hasOwnProperty('direct_message')) {
        var dmText = streamEvent['direct_message']['text'];
        var senderName = streamEvent['direct_message']['sender']['screen_name'];
        // streaming API sends us our own direct messages! skip if we're
        // the sender.
        if (senderName == myScreenName) {
            return;
        }
        // send a response!
        twitter.direct_messages(
            'new',
            {
                "screen_name": senderName,
                "text": "enjoy your trip '" + dmText + "'!"
            },
            accessToken,
            tokenSecret,
            function (err, data, resp) { console.log(err); }
        );
    }

    // otherwise, this was probably an incoming tweet. we'll check to see if
    // it starts with the handle of the bot and then send a response.
    else if (streamEvent.hasOwnProperty('text')) {
        if (streamEvent['text'].startsWith("@"+myScreenName+" ")) {
            var tweetId = streamEvent['id_str'];
            var tweeterHandle = streamEvent['user']['screen_name'];
            //random dice roll
            var diceRoll = Math.floor(Math.random()*100)+1;
            twitter.statuses(
                "update",
                //{"status": "@" + tweeterHandle + "+diceRoll.toString+take lots of pictures!",
               {"status": "@" + tweeterHandle + " , I'll try to post " + diceRoll.toString() + " " + cities[i-1].city + " recommendations!",
                "in_reply_to_status_id": tweetId},
               accessToken,
               tokenSecret,
               function (err, data, resp) { console.log(err); }
            );
        }
    }

    // if none of the previous checks have succeeded, just log the event
    else {
        console.log(streamEvent);
    }
} 


// tweet city destination
function tweet_names() {

	var MAX_DICE = 4;
	
	// a random int between [0 and MAX_DICE]
	var diceRoll = Math.floor(Math.random()*MAX_DICE);
	
	console.log("rolled name: " + diceRoll.toString());
	
	if (diceRoll == 0) {
		twitter.statuses("update",
			{"status": "Hello! Where are you headed? I am going to " + cities[i].city + ", " + cities[i].state + "."},
			accessToken,
			tokenSecret,
			function(error, data, response) {
				if (error) {
					console.log("something went wrong: " + util.inspect(error));
				}
			}
		);

	} else if (diceRoll == 1) {
		twitter.statuses("update",
			{"status": "Hi! Heading to " + cities[i].city + ", " + cities[i].state + ". Any tips on navigating the city?"},
			accessToken,
			tokenSecret,
			function(error, data, response) {
				if (error) {
					console.log("something went wrong: " + util.inspect(error));
				}
			}
		);
		
	} else if (diceRoll == 2) {
		twitter.statuses("update",
			{"status": "Greetings! On my way to " + cities[i].city + ", " + cities[i].state + ". Any suggestions on places to go?"},
			accessToken,
			tokenSecret,
			function(error, data, response) {
				if (error) {
					console.log("something went wrong: " + util.inspect(error));
				}
			}
		);	

	} else if (diceRoll == 3) {
		twitter.statuses("update",
			{"status": "Salutations! Going through " + cities[i].city + ", " + cities[i].state + ". It's supposed to be beautiful this time of year. Ever been?"},
			accessToken,
			tokenSecret,
			function(error, data, response) {
				if (error) {
					console.log("something went wrong: " + util.inspect(error));
				}
			}
		);

	} else {
		console.log("dice error names");
	}

	//console.log("sleeping");
	//sleep.sleep(10);
	i++;
	var counterString = i.toString();
	fs.writeFileSync("counter.txt", counterString, "utf8");

	//}
	

}




