module.exports = function(controller) {

    controller.middleware.receive.use(dialogflowMiddleware.receive);
 
    // listen for comma-separated 'hello-intent' or 'greeting-intent'
    controller.hears('weather,help', 'direct_message', dialogflowMiddleware.hears, function(bot, message) {
        console.log('SEND:', message);
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
