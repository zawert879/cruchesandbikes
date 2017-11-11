function formattedTime(){
    var date = new Date();
    var day =date.getDay();
    var month =date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = date.getSeconds();
    var time = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds;
    return time;
}


var accuweather = require('node-accuweather')()('MQ5mPDjyi50yNYJJmY0to8fGj8wnimyd');

const token = '477996150:AAEj8lEiKLv4sZzMCIY-wufi29zg_O1IZb0';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {polling: true});
const mysql = require('mysql');

const connection = mysql.createConnection({
    database : 'cruchesandbikes',
    host     : '192.168.161.57',
    user     : 'user',
    password : 'JfLsbnRLOIh2kNYO',
    connectionLimit: 100
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

let content;

bot.onText(/\/start/, (msg) => {
    content = true;
    const chatId = msg.from.id;
    bot.sendMessage(chatId, 'Добро пожаловать!');

    var query = connection.query("SELECT * FROM users WHERE telegram_id = '"+chatId+"'", function (error, results, fields) {
        console.log(results.length);
        if (results.length == 0)  {
            connection.query("INSERT INTO users (telegram_id) VALUES ('"+chatId+"')", function (error, results, fields) {
                if (results['city'] == null ) {
                    bot.sendMessage(chatId, 'Пожалуйста, введите ваш город(на английском):');
                    bot.on('message', city => {
                        if (content) {
                            city = city.text;
                            content = false;
                            var sql = "UPDATE users SET city = '" + city + "' WHERE telegram_id = '" + chatId + "' ";

                            connection.query(sql, (err, result) => {
                                if (err) throw err;
                                console.log("1 record inserted");
                            });
                        }
                    });
                }
            });
        }
    });
});

bot.onText(/\/погода/, (msg) => {
    const chatId = msg.from.id;
accuweather.getCurrentConditions("rostov-on-don", {unit: "Celsius"})
    .then(function(result) {
        bot.sendMessage(chatId, "В Ростове на дону "+result.Temperature+"  градусов по цельсию");
    });

});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});


bot.onText(/\/напомни (.+) в (.+)/i, (msg, match) => {
    var userId = msg.chat.id;
    var text = match[1];
    var time = match[2];
    var date = formattedTime();
    // notes.push( { 'uid':userId, 'time':time, 'text':text } );
    var sql = "INSERT INTO reminders (user_id, text, date, created_at) VALUES ('"+userId+"', '"+text+"', '"+time+"', '"+date+"')";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record inserted");
    });
    bot.sendMessage(userId, 'Отлично! Я обязательно напомню, если не сдохну :)');
});


setInterval(() => {
    time = formattedTime();
    // console.log(time);
    // var users_id = connection.query('SELECT user_id FROM reminders WHERE created_at = formattedTime', function (error, results, fields) {console.log(error)});
    // var telegram_users_id = connection.query('SELECT telegram_id FROM users', function (error, results, fields) {console.log(error)});
    // console.log("AAAAAAAAAA" . users_id);
    // console.log("BBBBBBBBBB" . telegram_users_id);
    // // connection.release();

    // for (var i=0; i <= users_id; i++) {
    //     if (telegram_users_id[i] == users_id[i]) {
    //         bot.sendMessage(query[i], 'Received your message');
    // }
}, 1000);