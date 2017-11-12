function formattedTime(){
    let date = new Date();
    let day = date.getDay();
    let month = date.getMonth();
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = date.getSeconds();
    let time = year + ' ' + hours + day + '.' + month + '.' + ':' + minutes.substr(-2) + ':' + seconds;
    return time;
}

const token = '477996150:AAEj8lEiKLv4sZzMCIY-wufi29zg_O1IZb0';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {polling: true});

const mysql = require('mysql');
const accuweather = require('node-accuweather')()('0SeYOltRoH1AkMj4NEC1cicWKDpNTzCl');


let stickersList = [
    'BQADAgADfgADEag0Bb5mxH0gvtktAg',
    'BQADAgADowADEag0BQs_xQSkcIFKAg',
    'BQADAgAD1wADEag0BTEYGb09JERjAg',
    'BQADAgAD5wADEag0BZAwDWvpwGrtAg',
    'BQADAgADxQADEag0BRBpCE1JOT4sAg',
    'BQADAgADwwADEag0BbGlUZ12nxZ8Ag',
    'BQADAgADvwADEag0Bf5nBjEjQyUYAg',
    'BQADAgADyQADEag0BYauZXVnHFqOAg'
];


bot.on('sticker', function(msg)
{
    let messageChatId = msg.chat.id;
    let messageStickerId = msg.sticker.file_id;
    let messageDate = msg.date;
    let messageUsr = msg.from.username;
    sendStickerByBot(messageChatId, stickersList[getRandomInt(0, stickersList.length)]);
});

function getRandomInt(aMin, aMax)
{
    return Math.floor(Math.random() * (aMax - aMin + 1)) + aMin;
}

function sendStickerByBot(aChatId, aStickerId)
{
    bot.sendSticker(aChatId, aStickerId, { caption: 'I\'m a cute bot!' });
}

const pool = mysql.createPool({
    database : 'cruchesandbikes',
    host     : 'localhost',
    user     : 'root',
    password : '',
    // host     : '192.168.161.57',
    // user     : 'user',
    // password : 'JfLsbnRLOIh2kNYO',
    // connectionLimit: 100
});

pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected!");
});


let content;

bot.onText(/\/start/, (msg) => {
    content = true;
    const chatId = msg.from.id;
    bot.sendMessage(chatId, 'Добро пожаловать!');
    pool.getConnection(function(err, connection) {
        connection.query("SELECT * FROM users WHERE telegram_id = '"+chatId+"'", function (error, results, fields) {
            connection.release();
            if (results.length == 0)  {
                connection.query("INSERT INTO users (telegram_id) VALUES ('"+chatId+"')", function (error, results, fields) {
                    connection.release();
                    if (results['city'] == null ) {
                        bot.sendMessage(chatId, 'Пожалуйста, введите ваш город(на английском):');
                        bot.on('message', city => {
                            if (content) {
                                city = city.text;
                                content = false;
                                let sql = "UPDATE users SET city = '" + city + "' WHERE telegram_id = '" + chatId + "' ";

                                connection.query(sql, (err, result) => {
                                    connection.release();
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
});

bot.onText(/\/напоминание/i, (msg) => {
    let chatId = msg.chat.id;
    let flag;
    if (flag) {
        bot.sendMessage(chatId, "О чем напомнить?");
        bot.on('message', context => {
            context = context.text;
        });
        flag = false;
    }

    if (!flag) {
        bot.sendMessage(chatId, "Когда напомнить? (дд.мм.гг. чч:мм)");
        bot.on('message', date => {
            date = date.text;
        });
        // unset(flag);
    }

    let date = formattedTime();
    let user_id = "SELECT id FROM user WHERE telegram_id = '"+chatId+"' ";
    let sql = "INSERT INTO reminders (user_id, text, date, created_at) VALUES ('"+user_id+"', '"+text+"', '"+time+"', '"+date+"')";
    pool.getConnection((err, connection) => {
        connection.query(sql, (err, result) => {
            connection.release();
            if (err) throw err;
            console.log("1 record inserted");
            bot.sendMessage(chatId, 'Отлично! Я обязательно напомню, если не сдохну :)');
        });
    });
});

bot.onText(/\/погода/, (msg) => {
    const chatId = msg.from.id;
    accuweather.getCurrentConditions("rostov-on-don", {unit: "Celsius"})
        .then(function(result) {
            console.log(result);
            let summary ;
            switch (result.Summary){
                case 'Cloudy':
                    summary = ', Облочно';
                    break;
                case 'rain':
                    summary = ', дождь';
                    break;
                case 'Light fog':
                    summary = ', легкий туман';
                    break;
                default :
                    summary = '';
                    break;
            }
            bot.sendMessage(chatId,"В Ростове на дону "+result.Temperature+"  градусов по цельсию"+summary);
        });
});
bot.onText(/\утро/,(msg)=>{
    const chatId = msg.chat.id;
    wakeup(chatId);
});

 wakeup = (chatId) => {
    accuweather.getCurrentConditions("rostov-on-don", {unit: "Celsius"})
        .then(function(result) {
            // console.log(result);
            let summary ;
            switch (result.Summary){
                case 'Cloudy':
                    summary = 'Облочно';
                    break;
                case 'rain':
                    summary = 'дождь';
                    break;
                case 'Light fog':
                    summary = 'легкий туман';
                    break;
                default :
                    summary = '';
                    break;
            }

            pool.getConnection(function(err, connection) {
                connection.query("SELECT * FROM reminders", (er, rows) => {
                    connection.re.lease();
                    if (er) throw er;  else {
                        let buff = '';
                        for (let i=0;i< rows.length;i++){
                            buff = buff+ rows[i].name+'\n';
                        }
                        let curtime =new Date().getHours() + ':' + new Date().getMinutes();

                        console.log(buff);
                        let message = 'Доброе утро' +'\n'+
                            "В Ростове на дону "+result.Temperature+" градусов по цельсию"+summary+'\n'+
                            'Сегодня 12 ноября ,'+curtime +'\n' +
                            'мои дела:\n'+buff;
                        bot.sendMessage(chatId,message);
                    }
                });
            });

        });
};

bot.onText(/\/лист/,(msg) =>{
    const chatId = msg.chat.id;
    pool.getConnection((err, connection) => {
        connection.query("SELECT * FROM reminders", (er, rows) => {
            connection.release();
            if (er) throw er;
            else {
                let buff = '';
                for (let i=0;i< rows.length;i++){
                    buff = buff+ rows[i].name+'\n';
                }
                // console.log(rows.length);
                // console.log(rows[0].name);
                bot.sendMessage(chatId, buff);
            }
        });
    });
});

bot.on('message', (msg) => {
        let curDate =new Date().getDate()+':'+new Date().getMonth()+':'+ new Date().getHours() + ':' + new Date().getMinutes();
        console.log(curDate+':'+msg.from.username+':'+msg.text);
});

let reminders;
let telegram_users_id;
//
// setInterval( () => {
//     let time = formattedTime();
//     pool.getConnection(function(err, connection) {
//         connection.query("SELECT * FROM reminders WHERE date < '"+ time +"' OR date = '"+ time +"' ", (error, results, fields) => {
//             connection.release();
//             reminders = results;
//             // console.log(error);
//             console.log(results);
//         });
//         // reminders.forEach( comparison => {
//         //     console.log(time);
//         //     console.log(comparison.date);
//         //     if (comparison.date < time || comparison.date == time) console.log("YES"); else console.log("NO");
//         // });
//         pool.getConnection((err, connection) => {
//             connection.query('SELECT telegram_id FROM users', (error, results, fields) => {
//                 connection.release();
//                 telegram_users_id = results;
//                 // console.log(error);
//                 // console.log(telegram_users_id);
//             });
//         });
//
//
//         // reminders.forEach(reminder => {
//         //     let message = 'Напоминание:\t\r' + ' создано ' + reminder.date + '\n\r' + reminder.text;
//         //     bot.sendMessage(reminder.user_id, message);
//         // });
//
//         // for (let i = 0; i < users_id.length; i++) {
//         //     if (telegram_users_id[i] == users_id[i]) {
//         //         bot.sendMessage(query[i], 'Received your message');
//         //     }
//     });
// }, 5000);