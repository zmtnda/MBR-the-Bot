// Set up dialogFlow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialog_token,
});
module.exports = function(controller) {

    controller.middleware.receive.use(dialogflowMiddleware.receive);
  
  controller.hears(['.*'], 'direct_message', dialogflowMiddleware.hears, function(bot, message) {
      console.log("direct_message hears", message)
      if (message.fulfillment.speech[0] == '_'){
          var response = getMBRdata( message);
          if (response == ''){
              getAssistance(bot, message);
          }
          else{
              bot.reply(message,response);
          }
        }
        else{
            bot.startConversation(message, function(err, convo) {
              convo.ask(message.fulfillment.speech, function(response, convo) {
                console.log("esponse.text",response.text)
                convo.next();
              });
            });
        }
      
      
    });

  controller.middleware.capture.use(function(bot, message, convo, next) {

    // user's raw response is in message.text
    console.log("message captured", message);
    if (message.fulfillment.speech[0] == '_' || message.text.toLowerCase() == 'yes' || message.text.toLowerCase() == 'no'){
          var response = ""
          if (message.fulfillment.speech[0] == '_' ){    
            response = getMBRdata( message);
          }
          if (response == '' && !(message.text.toLowerCase() == 'yes' || message.text.toLowerCase() == 'no')){
              getAssistance(bot, message);
          }
          else{
            var os = require('os');
            getSuggestion(message.fulfillment.speech.substring(1)).then(function(res){ 
              var msg = response + os.EOL + " \n"+ res.question; 
              bot.startConversation(message, function(err, convo) {
              // create a path for when a user says YES
              convo.addMessage({
                      text: res.answer,
              },'yes_thread');

              // create a path for when a user says NO
              // mark the conversation as unsuccessful at the end
              convo.addMessage({
                  text: 'Ok! Ask me anything about MBR.',
                  action: 'stop', // this marks the converation as unsuccessful
              },'no_thread');

              // create a path where neither option was matched
              // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
              convo.addMessage({
                  text: 'Sorry I did not understand. Say `yes` or `no`',
                  action: 'default',
              },'bad_response');

              // Create a yes/no question in the default thread...
              convo.ask(msg, [
                  {
                      pattern:  bot.utterances.yes,
                      callback: function(response, convo) {
                          convo.gotoThread('yes_thread');
                      },
                  },
                  {
                      pattern:  bot.utterances.no,
                      callback: function(response, convo) {
                          convo.gotoThread('no_thread');
                      },
                  },
                  {
                      default: true,
                      callback: function(response, convo) {
                          convo.gotoThread('bad_response');
                      },
                  }
              ]);

              convo.activate();
              // capture the results of the conversation and see what happened...
              convo.on('end', function(convo) {
                if (convo.successful()) {
                  console.log("convo end msg", message);
                  getSuggestion(message.fulfillment.speech.substring(1)).then(function(res){ 
                    var msg = res.question; 
                    bot.startConversation(message, function(err, convo) {
                    convo.addMessage({
                            text: res.answer,
                            action: 'default',
                    },'yes_thread');
                    convo.addMessage({
                        text: 'Ok! Ask me anything about MBR.',
                        action: 'stop', 
                    },'no_thread');
                    convo.addMessage({
                        text: 'Sorry I did not understand. Say `yes` or `no`',
                        action: 'default',
                    },'bad_response');
                    convo.ask(msg, [
                        {
                            pattern:  bot.utterances.yes,
                            callback: function(response, convo) {
                                convo.gotoThread('yes_thread');
                            },
                        },
                        {
                            pattern:  bot.utterances.no,
                            callback: function(response, convo) {
                                convo.gotoThread('no_thread');
                            },
                        },
                        {
                            default: true,
                            callback: function(response, convo) {
                                convo.gotoThread('bad_response');
                            },
                        }
                    ]);
                        convo.activate();
                    });

                  }).catch(e => {
                     // error caught DO SOMETHING
                    console.log(e);
                  });
                }
              });
          });
              // bot.reply(message,msg);

          }).catch(e => {
               // error caught DO SOMETHING
              console.log(e);
            });
          }
        }
        else{
            bot.startConversation(message, function(err, convo) {
              convo.ask(message.fulfillment.speech, function(response, convo) {
                console.log("esponse.text",response.text)
                convo.next();
              });
            });
        }
    // always call next!
    next();

});
    // simple function to generate the corresponding MBR responses
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync('./shared/intents.json', 'utf8'));
    function getMBRdata(tag) {
        var text = ""; 
        obj.intents.forEach(element => {
            if (element.tag == tag.fulfillment.speech.substring(1)){
                text = element.responses[0];
                return text;
            }
        });
        return text; 

    }

    //simple funciton to handle ambiguous query
    function getAssistance(bot, message){
        bot.startConversation(message, function(err, convo) {
            convo.say('I am sorry I do not understand what you are saying. If you need assistance I can add a support member to continue the conversation.');
            convo.ask('Is that what you want? (Y/N)', function(response, convo) {
                if(response.text == 'Y'){
                    convo.say('Support member, Matt has entered the room. Thanks for using MBR-the-Bot');
                    convo.next();
                }

            });
        });
    }
  
  //simple funciton to suggest next possible query
    function getSuggestion(tag){
        var dictionary = { "suggestions" : [
          {
            "tag" : "CANADA_Americas_actualsWTD",
            "next" : ["CANADA_Americas_currWeekForecast","CANADA_Americas_currWeekToGoTogo"]
          },
          {
            "tag" : "Current_WTD_Actuals_Americas_approx",
            "next" : ["Current_Week_to_Go_Americas_exact","Current_Week_Forecast_Americas_approx"]
          },
          {
            "tag" : "Current_Week_Forecast_Americas_exact",
            "next" : ["Current_Week_to_Go_Americas_approx","Current_WTD_Actuals_Americas_approx"]
          },
          
        ]};
      console.log("Tag", tag)
      return new Promise((resolve, reject) => {
        var msg = ""
        for (var key in dictionary.suggestions) {
          console.log("key.tag ", dictionary.suggestions[key].tag )
          if (dictionary.suggestions[key].tag == tag){
            var sugeested_tag = dictionary.suggestions[key].next[Math.floor(Math.random()*dictionary.suggestions[key].next.length)];
            obj.intents.forEach(element => {
              if (element.tag == sugeested_tag){
                  msg = "Do you also want to know "+element.patterns[Math.floor(Math.random()*element.patterns.length)] + "?";
                  var sug = {
                  "question" : msg,
                  "answer" : element.responses[0]
                  }
                  console.log("sug",sug)  
                  resolve(sug)
              }
            });
          }
        }    
        reject("failed: error in getSuggestion");
      })
    }

}