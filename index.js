const TelegramBot = require('node-telegram-bot-api');

const mysql = require('mysql');

const cMysql = mysql.createPool({
        database : 'test',
        host     : 'localhost',
        user     : 'root',
        password : '',
        connectionLimit: 100
    });

cMysql.getConnection(function(err,conn){
    if(err){
        console.log("MYSQL: can't get connection from pool:",err)
    }else {
        conn.query("SELECT * FROM test",
            function(er,rows){
                if(er){
                    conn.release();
                    console.log("MYSQL: ERROR: ",err);
                } else {
                    conn.release();
                    console.log(rows);
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
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
 
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
 
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});
 
// Listen for any kind of message. There are different kinds of
// messages.

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
messageLog();
addinsql(msg.text);
// send a message to the chat acknowledging receipt of their message
bot.sendMessage(chatId, 'Received your message');
});






function messageLog(msg){
// console.log(msg);
// console.log(msg.from.username+':'+msg.text);
};

function addinsql(name) {
    cMysql.getConnection(function(err,conn){
        if(err){
            console.log("MYSQL: can't get connection from pool:",err)
        }else {
            conn.query("INSERT INTO test (name) VALUES ('"+name+"')",
                function(er,rows){
                    if(er){
                        conn.release();
                        console.log("MYSQL: ERROR: ",err);
                    } else {

                        conn.release();

                        // make someting with rows
                    }
                });
        }
    });


}

