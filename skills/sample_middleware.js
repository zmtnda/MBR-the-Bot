// Set up dialogFlow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialog_token,
});
module.exports = function(controller) {

    controller.middleware.receive.use(dialogflowMiddleware.receive);
    controller.hears(['.*'], ['direct_message'],dialogflowMiddleware.hears,function(bot, message) {
    console.log("message",JSON.stringify(message),message.fulfillment.speech[0] );
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
    // always call next!
    next();

});

//     controller.middleware.send.use(function(bot, message, next) {

//         // do something useful...
//         if (message.intent == 'hi') {
//             message.text = 'Hello!!!';
//         }
//         next();

//     });

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

}
