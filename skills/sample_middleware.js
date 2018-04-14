module.exports = function(controller) {

    controller.middleware.receive.use(function(bot, message, next) {
    
        bot.startRTM();
        // listen for comma-separated 'hello-intent' or 'greeting-intent'
        controller.hears('weather,help', 'direct_message', dialogflowMiddleware.hears, function(bot, message) {
            bot.reply(message, 'Hello!');
        });
        console.log('RCVD:', message);
        next();
    
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
