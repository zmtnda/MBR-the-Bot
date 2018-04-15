// Set up dialogFlow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialog_token,
});
module.exports = function(controller) {

    // controller.middleware.receive.use(function(bot, message, next) {
    
    //     // do something...
    //     console.log('SEND:', message);
    //     next();
    
    // });
    // controller.middleware.receive.use(dialogflowMiddleware.receive);
    // // listen for comma-separated 'hello-intent' or 'greeting-intent'
    // controller.hears('weather,help', 'direct_message', dialogflowMiddleware.hears, function(bot, message) {
    //     bot.reply(message, 'Hello!');
    // });    
    //
    controller.middleware.send.use(function(bot, message, next) {
    
        // do something...
    
        if (message.intent == 'help') {
            message.text = 'Hello!!!';
        }
        console.log('SEND:', message);
        bot.reply(message, 'Hello!');
        next();
    
    });

}
