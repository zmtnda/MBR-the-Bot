// Set up dialogFlow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialog_token,
});
var os = require('os');
// simple function to generate the corresponding MBR responses
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./shared/intents.json', 'utf8'));


module.exports = function(controller) {
  var phrase = ""; 

  controller.middleware.normalize.use(function(bot, message, next) {

    console.log("I m normalizing sth", JSON.stringify(message))
    
    if (message.text.toLowerCase() == "yes"){
      message.text = "What is " + phrase + "?";
    }

    // call next to proceed
    next();      

});
  controller.middleware.receive.use(dialogflowMiddleware.receive);
  controller.hears(['.*'], 'direct_message', dialogflowMiddleware.hears, function(bot, message) {
      console.log("I m hearing sth", JSON.stringify(message))
      var array = message.intent.split('-');
      var intent = array[array.length - 1]
      console.log("intent", intent)
      if (intent.indexOf('_') > -1){
        var response = getMBRdata(intent);
        var next_intent = message.fulfillment.speech;
        obj.intents.forEach(element => {
          if (element.tag == next_intent){
            // get the last phrases of the patterns array: element.responses.length - 1
              phrase = element.patterns[element.patterns.length - 1];
              return phrase;
          }
        });
        var msg = response + os.EOL + " \n"+ "Do you also want to know " + phrase + "?"; 
        bot.startConversation(message, function(err, convo) {
          convo.ask(msg, function(response, convo) {
            console.log("response",response);

            // convo.say(response);
            convo.next(); 
          });
        });
      }
    else{
      bot.startConversation(message, function(err, convo) {
        convo.ask(message.fulfillment.speech, function(response, convo) {
          convo.next(); 
        });
      });
    }
    
      
  });
 
  
//   controller.middleware.receive.use(function(bot, message, next) {
//     console.log("I m receiving sth", JSON.stringify(message))
//     bot.startConversation(message, function(err, convo) {
//       convo.ask(message.text, function(response, convo) {
//       // convo.say('Cool, I like ' + response.text + ' too!');
//       convo.next(); 

//       });
//     });

//     next();

//   });
//   controller.middleware.send.use(function(bot, message, next) {

//     console.log("I m sending sth", JSON.stringify(message))
    
//     next();

//   });
  controller.middleware.capture.use(function(bot, message, convo, next) {
    console.log("I m capturing sth", JSON.stringify(message))
    if (message.intent.toLowerCase() == "no"){
      convo.say(message.fulfillment.speech);
      // convo.stop();
    }
    else {
      var array = message.intent.split('-');
      var intent = array[array.length - 1]
      console.log("intent", intent)
      var response = getMBRdata(intent);
      var next_intent = message.fulfillment.speech;
      obj.intents.forEach(element => {
        if (element.tag == next_intent){
          // get the last phrases of the patterns array: element.responses.length - 1
            phrase = element.patterns[element.patterns.length - 1];
            return phrase;
        }
      });
      var msg = response + os.EOL + " \n"+ "Do you also want to know " + phrase + "?"; 
      bot.startConversation(message, function(err, convo) {
        convo.ask(msg, function(response, convo) {
          console.log("response",response);

          // convo.say(response);
          convo.next(); 
        });
      });
    }
    
    next();
  })
  
  function getMBRdata(tag) {
      var text = ""; 
      obj.intents.forEach(element => {
          if (element.tag == tag){
              text = element.responses[0];
              return text;
          }
      });
      return text; 

  }
  
}