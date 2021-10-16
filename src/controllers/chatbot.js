// const chatbotService = require('../service/chatbot');

// let start = false;

// function authChatBot(req, res) {
//   let { VERIFY_TOKEN } = process.env;

//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];

//   if (mode && token) {
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//       console.log('WEBHOOK_VERIFIED');
//       res.status(200).send(challenge);
//     } else {
//       res.sendStatus(403);
//     }
//   }
// }

// async function postChatBot(req, res) {
//   let { body } = req;
//   if (body.object === 'page') {
//     body.entry.forEach(async (entry) => {
//       let webhook_event = entry.messaging[0];
//       let sender_psid = webhook_event.sender.id;
//       let post;

//       if (webhook_event.message) {
//         post = await chatbotService.handleMessage(sender_psid, webhook_event.message);
//       } else if (webhook_event.postback) {
//         post = await chatbotService.handlePostback(sender_psid, webhook_event.postback);
//       }
//     });

//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     res.sendStatus(404);
//   }
// }
// module.exports = {
//   authChatBot,
//   postChatBot,
// };
