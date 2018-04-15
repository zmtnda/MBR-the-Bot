// Set up dialogFlow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialog_token,
});
module.exports = function(controller) {

    controller.middleware.receive.use(dialogflowMiddleware.receive);
    controller.hears(['.*'], ['direct_message'],dialogflowMiddleware.hears,function(bot, message) {
      console.log(JSON.stringify(message));
      console.log('test middleware');
      bot.reply(message, message.fulfillment.speech);
    });

//     controller.middleware.send.use(function(bot, message, next) {

//         // do something useful...
//         if (message.intent == 'hi') {
//             message.text = 'Hello!!!';
//         }
//         next();

//     });

}
