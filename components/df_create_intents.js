// We need this to build our post string
var http = require('http');
var request = require('request');

function createIntent(name){
    var intent = {}
    intent["name"]= name
    // setContext()
    console.log(intent)
}

  // Build the post string from an object
  var intent = {
    "contexts": [
      "shop"
    ],
    "events": [],
    "fallbackIntent": false,
    "name": "add-to-list-zin",
    "priority": 500000,
    "responses": [
      {
        "action": "add.list",
        "affectedContexts": [ //setting context
          {
            "lifespan": 5,
            "name": "shop",
            "parameters": {}
          },
          {
            "lifespan": 5,
            "name": "chosen-fruit",
            "parameters": {}
          }
        ],
        "defaultResponsePlatforms": {
          "google": true
        },
        "messages": [
          {
            "platform": "google",
            "textToSpeech": "Okay. How many $fruit?",
            "type": "simple_response"
          },
          {
            "speech": "Okay how many $fruit?",
            "type": 0
          }
        ],
        "parameters": [
          {
            "dataType": "@fruit",
            "isList": true,
            "name": "fruit",
            "prompts": [
              "I didn't get that. What fruit did you want?"
            ],
            "required": true,
            "value": "$fruit"
          }
        ],
        "resetContexts": false
      }
    ],
    "templates": [
      "@fruit:fruit ",
      "Add @fruit:fruit ",
      "I need @fruit:fruit "
    ],
    "userSays": [
      {
        "count": 0,
        "data": [
          {
            "alias": "fruit",
            "meta": "@fruit",
            "text": "oranges",
            "userDefined": true
          }
        ]
      },
      {
        "count": 0,
        "data": [
          {
            "text": "Add "
          },
          {
            "alias": "fruit",
            "meta": "@fruit",
            "text": "bananas",
            "userDefined": true
          }
        ]
      },
      {
        "count": 0,
        "data": [
          {
            "text": "I need "
          },
          {
            "alias": "fruit",
            "meta": "@fruit",
            "text": "apples",
            "userDefined": true
          }
        ]
      }
    ],
    "webhookForSlotFilling": false,
    "webhookUsed": false
  }

  // An object of options to indicate where to post to
  var post_options = {
      url: 'https://api.dialogflow.com/v1/intents?v=20150910',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 4ce310af10d54f7f914c09603500f38b',
          'Content-Length': intent.length
      },
      json: intent
  };
    function callback(error, response, body) {
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
            console.log(info);
        }
        else {
            console.log('Error happened: '+ error);
        }
    }

//send request
request(post_options, callback);
createIntent("greeting");
