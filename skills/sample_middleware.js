module.exports = function(controller) {

    // Set up dialogFlow middleware
    var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
        token: process.env.dialog_token,
    });

    controller.middleware.receive.use(dialogflowMiddleware.receive);
    // listen for comma-separated 'hello-intent' or 'greeting-intent'
    controller.hears('weather,help', 'direct_message', dialogflowMiddleware.hears, function(bot, message) {
        bot.reply(message, 'Hello!');
    });    
    //
    // controller.middleware.send.use(function(bot, message, next) {
    //
    //     // do something...
    //     console.log('SEND:', message);
    //     next();
    //
    // });

}
