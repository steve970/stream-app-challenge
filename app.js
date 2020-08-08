// Client Side

const axios = require('axios');
const { StreamChat } = require('stream-chat');

function fetchToken() {
  return axios.post('http://localhost:3000/')
};

async function main() {

  try {

    async function flagAMessage(message) {
      const flag = await chatClient.flagMessage(message.message.id);
      console.log("Flagged messaged id: " + flag.flag.target_message_id);
    }

    async function editAMessage(message) {
      const editedMessage = { id: message.message.id, text: 'Does anyone know when the farmer\'s market opens this weekend?'};
      const update = await chatClient.updateMessage(editedMessage);
      return update;
    }

    async function sendAMessage() {
      const message = await channel.sendMessage({
        text: 'Does anyone know when the farmer\'s market opens today?'
      })
      return message;
    }

    async function fetchChannelList() {
      const filter = {type: 'team', members: {$in: ['steve']} };
      const sort = { last_message_at: -1 };
      const channels = await chatClient.queryChannels(filter, sort, {
        watch:true,
        state:true
      });

      for (const c of channels) {
        console.log("I fetched a list of all the channels, so far: " + c.data.name);
      }
    };

    const response = await fetchToken();
    const { token } = response.data;
    const apiKey = response.data.api_key;

    const chatClient = new StreamChat(apiKey);
    await chatClient.setUser(
      {
        id: 'steve',
      },
      token
    );

    const channel = chatClient.channel('team', 'old-mcdonalds-farm');
    await channel.watch();
    try {

      // Fetch a channel list
      await fetchChannelList();

      // Send a Message
      let firstMessage = await sendAMessage();
      console.log("My first message sent: " + firstMessage.message.text);

      //Edit a Message
      firstMessage = await editAMessage(firstMessage);
      console.log("I edited my first message sent: " + firstMessage.message.text);

      //Flag a Message
      await flagAMessage(firstMessage);

      //React to a Message
      const reaction = await channel.sendReaction(firstMessage.message.id, {
        type: 'love',
      })
      console.log("My edited message, " + firstMessage.message.text + ", got it's first reaction: " + reaction.reaction.type );

    } catch (err) {
      console.log(err);
    };
  } catch (err) {
    console.log(err);
  }
}
main();
