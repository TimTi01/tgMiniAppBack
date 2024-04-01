const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const token = process.env.TOKEN;
const webAppUrl = process.env.WEBAPPURL;

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  bot.sendMessage(chatId, 'Received your message');

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Добро пожаловать! \n\n Для начала заправки нажмите кнопку ниже', {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Заправиться!', web_app: {url: webAppUrl}}]
        ],
      }
    });
  }
});

app.get('/', (req, res) => {
  res.send('Server working!');
})

app.post('/get-payment-slip', async (req, res) => {
  const {queryId, totalPrice} = req.body;
  
  try {
    bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка!',
      input_message_content: {
        message_text: `Сумма покупки: ${totalPrice} рублей`
      }
    })

    return res.status(200).json({})
  } catch (e) {
    bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Что-то пошло не так',
      input_message_content: {
        message_text: `Что-то пошло не так :(`
      }
    })

    return res.status(500).json({})
  }

})

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
