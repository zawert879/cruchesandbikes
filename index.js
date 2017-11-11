const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');

var accuweather = require('node-accuweather')()('MQ5mPDjyi50yNYJJmY0to8fGj8wnimyd');




const cMysql = mysql.createPool({
        database : 'cruchesandbikes',
        host     : 'localhost',
        user     : 'root',
        password : '',
        connectionLimit: 100
    });

    cMysql.getConnection(function (err, conn) {
        if (err) {
            console.log("MYSQL: can't get connection from pool:", err)
        } else {
            conn.query("SELECT * FROM test",
                function (er, rows) {
                    if (er) {
                        conn.release();
                        console.log("MYSQL: ERROR: ", err);
                    } else {
                        conn.release();
                        console.log(rows[1])
                        // make someting with rows
                    }
                });
        }
    });




 
// replace the value below with the Telegram token you receive from @BotFather
const token = '452480076:AAE4bSOiAeZO2iDmcdgnPfROZxVNUUEcu20';
 
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
 
// Matches "/echo [whatever]"

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.from.id;
  const resp = match[1]; // the captured "whatever"
  // send back the matched "whatever" to the chat

    bot.sendMessage(chatId, resp);
});
bot.onText(/\/start/, (msg) => {
    const chatId = msg.from.id;
bot.sendMessage(chatId, 'Добро пожаловать');
});
bot.onText(/\/погода/, (msg) => {
    const chatId = msg.from.id;
accuweather.getCurrentConditions("rostov-on-don", {unit: "Celsius"})
    .then(function(result) {
        bot.sendMessage(chatId, "В Ростове на дону "+result.Temperature+"  градусов по цельсию");
    });

});


bot.onText(/\/лист/,(msg) =>{
   const chatId = msg.chat.id;

    cMysql.getConnection(function (err, conn) {
        if (err) {
            console.log("MYSQL: can't get connection from pool:", err)
            } else {
            conn.query("SELECT * FROM test",
                function (er, rows) {
                    if (er) {
                        conn.release();
                        console.log("MYSQL: ERROR: ", err);
                    } else {
                        conn.release();
                        var kek = '';
                        for (var i=0;i< rows.length;i++){
                            kek = kek+ rows[i].name+'\n';
                        }
                            // console.log(rows.length);
                            // console.log(rows[0].name);
                            bot.sendMessage(chatId, kek);
                    }
                });
        }
    });
});



// Listen for any kind of message. There are different kinds of
// messages.
//
// function addinsql(name) {
//     cMysql.getConnection(function(err,conn){
//         if(err){
//             console.log("MYSQL: can't get connection from pool:",err)
//         }else {
//             conn.query("INSERT INTO test (name) VALUES ('"+name+"')",
//                 function(er,rows){
//                     if(er){
//                         conn.release();
//                         console.log("MYSQL: ERROR: ",err);
//                     } else {
//                         conn.release();
//                     }
//                 });
//         }
//     });
// }

bot.on('message', (msg) => {
    // console.log(msg);
        var curDate =new Date().getDate()+':'+new Date().getMonth()+':'+ new Date().getHours() + ':' + new Date().getMinutes();
        console.log(curDate+':'+msg.from.username+':'+msg.text);
});

