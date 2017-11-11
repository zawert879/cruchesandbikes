const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');
const accuweather = require('node-accuweather')()('0SeYOltRoH1AkMj4NEC1cicWKDpNTzCl');


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

// bot.onText(/\/погода/, (msg) => {
//     const chatId = msg.from.id;
//     accuweather.getCurrentConditions("rostov-on-don", {unit: "Celsius"})
//         .then(function(result) {
            console.log(result);
            // let summary ;
            // switch (result.Summary){
            //     case 'Cloudy':
            //         summary = 'Облочно';
            //         break;
            //     case 'rain':
            //         summary = 'дождь';
            //         break;
            //     case 'Light fog':
            //         summary = 'легкий туман';
            //         break;
            //     default :
            //         summary = '';
            //         break;
            // }
            // bot.sendMessage(chatId,"В Ростове на дону "+result.Temperature+"  градусов по цельсию,"+summary);
        // });
// });
// bot.onText(/\утро/,(msg)=>{
//     const chatId = msg.chat.id;
//     wakeup(chatId);
// });
function wakeup(chatId) {
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
                        let buff = '';
                        conn.release();
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
        }

    });
        });
}


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
                        let buff = '';
                        for (let i=0;i< rows.length;i++){
                            buff = buff+ rows[i].name+'\n';
                        }
                            // console.log(rows.length);
                            // console.log(rows[0].name);
                            bot.sendMessage(chatId, buff);
                    }
                });
        }
    });
});

bot.on('message', (msg) => {
    // console.log(msg);
        let curDate =new Date().getDate()+':'+new Date().getMonth()+':'+ new Date().getHours() + ':' + new Date().getMinutes();
        console.log(curDate+':'+msg.from.username+':'+msg.text);
});

