// Server Side
require('dotenv').config();

const express = require('express');
const { StreamChat } = require('stream-chat');

const app = express();

//instantiate server-side client
const client = new StreamChat(
  process.env.STREAM_API_KEY,
  process.env.STREAM_APP_SECRET
);


//create a few users
async function addMoreUsers() {
  try {
    let newUsers = await client.updateUsers([{
      id: 'emi',
      name: 'Emi',
      favorite_vegetable: 'avocado',
    },{
      id: 'gil',
      name: 'Gil',
      favorite_vegetable: 'beans',
    },{
      id: 'bert',
      name: 'Bert',
      favorite_vegetable: 'tomato',
    },{
      id: 'bugs-bunny',
      name: 'Bugs Bunny',
      favorite_vegetable: 'carrot',
    },{
      id: 'old-mcdonald',
      name: 'Old McDonald',
      favorite_vegetable: 'corn'
    }]);
    for (const user in newUsers.users) {
      console.log("New user added: " + user)
    }
  } catch (err) {
    console.log(err);
  }
}

app.post('/', async (req,res) => {
  try {
    console.log("New Stream Chat Client insantiated...");
    //set a current user
    const token = client.createToken('steve')
    const steve = await client.updateUser(
      {
        id: 'steve',
        name: 'Steve Hirschhorn',
        favorite_vegetable: 'squash',
        role: 'admin',
      },
      token
    );
    console.log("The current user is: " + steve.users.steve.id);

    await addMoreUsers();

    const channel = client.channel('team', 'old-mcdonalds-farm', {
      //Update a channel to have a name
      name: 'Old McDanold\'s Farm'
    });
    console.log("Channel created: " + channel.data.name);

    await channel.create();
    // added members to channel
    let newChannelMembers = await channel.addMembers(['steve', 'emi', 'gil', 'bert', 'old-mcdonald', 'bugs-bunny']);
    await newChannelMembers.members.forEach( (newMember) => {
      console.log("New member add to " + channel.data.name + ": " + newMember.user_id);
    })
    console.log("Total number of members in channel: " + channel.data.member_count)

    // remove member
    let removeMember = await channel.removeMembers(['bert'], { text: 'Too many people in the channel!', user_id: 'bert' });
    console.log(removeMember.message.user.id + " was removed. Total number of members in channel: " + channel.data.member_count);

    // promote a moderator
    let newModerators = await channel.addModerators(['old-mcdonald', 'steve']);
    newModerators.members.forEach( (user) => {
      user.is_moderator ? console.log(user.user_id + " has been added as a moderator") : null;
    })

    // ban user
    let bannedUser = await channel.banUser('bugs-bunny', {
      reason: 'He ate all the damn carrots!',
      user_id: 'steve'
    });
    console.log("Is bugs bunny banned? " + channel.state.members['bugs-bunny'].user.banned);
    console.log("Is gil banned? " + channel.state.members['gil'].user.banned);

    res.status(200).json({ user: 'steve', token, api_key: process.env.STREAM_API_KEY });

    client.disconnect
  } catch (err) {
    console.log(err);
    res.status(500);
  }
})

const server = app.listen(3000, () => {
    const { port } = server.address();
    console.log(`Server running on PORT ${port}`);
});
