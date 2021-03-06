// Set up dialogFlow middleware
// var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
//   token: process.env.dialog_token,
// });
var os = require('os');
// simple function to generate the corresponding MBR responses
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./shared/intents.json', 'utf8'));


module.exports = function(controller) {
var phrase = ""; 
var rasa = require('botkit-rasa')({
  rasa_uri: 'http://localhost:5005',
  //rasa_project: "default"
});
controller.middleware.receive.use(rasa.receive);
controller.middleware.normalize.use(function(bot, message, next) {
  console.log("I m normalizing sth", JSON.stringify(message))
  if (message.text.toLowerCase() == "yes"){
    message.text = "What is " + phrase + "?";
  }
  // call next to proceed
  next();      
});

controller.hears(['.*'], 'direct_message', function(bot, message) {
  console.log("I m hearing sthfdasfasdfasdf", JSON.stringify(message))
  var array = message.intent.split('-');
  var intent = array[array.length - 1]
  console.log("intent hearing", intent)
  if (intent.indexOf('_') > -1){
    var response = getMBRdata(intent);
    var isnum = /^\d+$/.test(response);
    if (isnum)
      response = "$ "+response + "K";
    var next_intent = message.fulfillment.speech;
    if (next_intent != ""){
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
          console.log("response hearing",response);

          // convo.say(response);
          convo.next(); 
        });
      });
    }else{
      bot.startConversation(message, function(err, convo) {
        console.log("intent hearing start convo", response)
        convo.sayFirst(response);
      });
    }
  }
  else{
    bot.startConversation(message, function(err, convo) {
      convo.ask(message.fulfillment.speech, function(response, convo) {
        convo.next(); 
      });
    });
  }
});

controller.middleware.capture.use(function(bot, message, convo, next) {
  console.log("I m capturing sth", JSON.stringify(message))
  var array = message.intent.split('-');
  var intent = array[array.length - 1]
  console.log("intent capture", intent)
  //|| message.fulfillment.speech.indexOf('_') <= -1
  if (message.intent.toLowerCase() == "no" || intent.indexOf('_') <= -1){
    convo.say(message.fulfillment.speech);
  } 
  else {  
    var response = getMBRdata(intent);
    var isnum = /^\d+$/.test(response);
    if (isnum)
      response = "$ "+ response + "K";
    var next_intent = message.fulfillment.speech;
    if (next_intent != ""){
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
          console.log("response capture",response);
          convo.next(); 
        });
      });
    }else{
      bot.startConversation(message, function(err, convo) {
        console.log("intent hearing start convo", response)
        convo.sayFirst(response);
      });
    }
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