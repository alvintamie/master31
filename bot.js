if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var solver = require('./solver31.js');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['play'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'lebe-lebe-matabelo',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

    bot.reply(message, '.......Get ready in.......')
    setTimeout(function(){ bot.reply(message, '...............3..............'); }, 1000);
    setTimeout(function(){ bot.reply(message, '...............2..............'); }, 2000);
    setTimeout(function(){ bot.reply(message, '...............1..............'); }, 3000);
    setTimeout(function(){
        controller.storage.channels.get(message.channel, function(err, data){
            var targetNumber = 28;
            if(data && data.targetNumber) {
                console.log("CUPU")
                targetNumber = data.targetNumber + 1;
            }
            if(targetNumber > 39) {
                targetNumber = 28;
            }
            questions = generateQuestion();
            controller.storage.channels.save({id: message.channel, questions:questions, targetNumber: targetNumber}, function(err){});
            bot.reply(message, "Goal: "+ targetNumber);
            bot.reply(message, "Solve: "+ questions[0]+ " " + questions[1]+ " " + questions[2]+ " " + questions[3])
        })
   }, 4000);
});

controller.hears(['hint'], 'direct_message,direct_mention,mention', function(bot, message) {
    data = controller.storage.channels.get(message.channel, function(err, data){
        if(data && data.questions && data.targetNumber) {
            var problem_input = data.questions.join(" ")
            var solution = solver.solve(problem_input, data.targetNumber, ['+','-','*','/', '**']);

            if(solution == "NO SOLUTION!") {
                bot.reply(message, 'There are no solution. Please play again :)')
                controller.storage.channels.save({id: message.channel, questions:null}, function(err){});
            } else {
                bot.reply(message, 'There is a solution')
            }
        } else {
            bot.reply(message, 'There are no numbers to solve.')
        }
    })
})

controller.hears(['giveup'], 'direct_message,direct_mention,mention', function(bot, message) {
    data = controller.storage.channels.get(message.channel, function(err, data){
        if(data && data.questions && data.targetNumber) {
            var problem_input = data.questions.join(" ")
            var solution = solver.solve(problem_input, data.targetNumber, ['+','-','*','/', '**']);

            bot.reply(message, "Goal: "+ data.targetNumber);
            bot.reply( message, 'Will solve: [' + problem_input + ']');
            bot.reply( message, 'Solution is: ' + solution);
            controller.storage.channels.save({id: message.channel, questions:null, targetNumber: data.targetNumber}, function(err){});
        } else {
            bot.reply(message, "There are no numbers to solve.")
        }
    });
})

controller.hears(['solve: ([0-9\s ]+)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var problem_input = message.match[1].trim();
    bot.reply( message, 'Will solve: [' + problem_input + ']');
    var solution = solver.solve(problem_input, 31, ['+','-','*','/', '**']);
    bot.reply( message, 'Solution is: ' + solution);
});

controller.hears(['solve_with_target: ([0-9\s ]+), ([0-9]+)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var problem_input = message.match[1].trim();
    var target = parseInt(message.match[2].trim());
    bot.reply( message, 'May solve: [' + problem_input + '] with target: [' + target + ']');
    var solution = solver.solve(problem_input, target, ['+','-','*','/', '**']);
    bot.reply( message, 'Solution is: ' + solution);
});

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}


NUMBERS = [1,2,3,4,5,6,7,8,9,10,10]
function generateQuestion() {
    questions = [];
    for(var i=0; i<4; i++) {
        questions.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
    }
    return questions
}
