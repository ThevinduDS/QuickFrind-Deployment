const nodemailer = require('nodemailer');
const config = require('./config'); // Replace with your config file

const transporter = nodemailer.createTransport({
    service: 'Gmail', // or your email provider
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

module.exports = transporter;
