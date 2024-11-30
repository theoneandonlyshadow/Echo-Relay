const { EmbedBuilder } = require('discord.js');
const embed = new EmbedBuilder()
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(""); //webhook link

function submitForm() {
    const formData = {
        name: document.getElementById('name').value,
        companyName: document.getElementById('companyName').value,
        emailAddress: document.getElementById('emailAddress').value,
        stipend: document.getElementById('stipend').value,
        role: document.getElementById('role').value,
        message: document.getElementById('message').value
    };

    embed.setTitle('Echo Relay Feedback')
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
    }, )

    embed.setColor('#10101a')
    embed.setTimestamp();
    hook.send({
        embeds: [embed]
    });
    alert('Thank you for submitting the form!'); // change into popup
    console.log("shit was sent");
}