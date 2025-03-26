"use strict";
const { EmbedBuilder } = require('discord.js');
const embed = new EmbedBuilder();
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(""); //webhook link
function bugin404() {
    // document.getElementById('send-btn').innerHTML("Your message was forwarded.")
    const formData = {
        name: document.getElementById('name').value,
        emailAddress: document.getElementById('emailAddress').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    embed.setTitle('Echo Relay Feedback');
    embed.addFields({
        name: 'Name:',
        value: formData.name
    }, {
        name: 'Email:',
        value: formData.emailAddress,
        inline: true
    }, {
        name: 'Subject:',
        value: formData.subject,
        inline: true
    }, {
        name: 'Message',
        value: formData.message,
        inline: true
    });
    embed.setColor('#10101a');
    embed.setTimestamp();
    try {
        hook.send({
            embeds: [embed]
        });
        document.getElementById('send-btn').innerHTML("Your message was forwarded.");
    }
    catch (err) {
        document.getElementsByClassName('send-btn').innerHTML("Your message was not sent.");
    }
    alert('Thank you for submitting the form!'); // change into popup
    console.log("shit was sent");
}
