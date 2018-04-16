// Set up dialogFlow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialog_token,
});
module.exports = function(controller) {

    controller.middleware.receive.use(dialogflowMiddleware.receive);
    controller.hears(['.*'], ['direct_message'],dialogflowMiddleware.hears,function(bot, message) {
    console.log(JSON.stringify(message));
    var response = getMBRdata( message);
    if (response == ''){
        bot.reply(message,"Sorry couldn't find the data");
    }
    else{
        bot.reply(message,response);
    }
      
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
            if (element.tag == tag.fulfillment.speech){
                text = element.responses[0];
                return text;
            }
        });
        return text;

    }

}
