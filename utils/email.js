import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Andrew <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, '..', 'views', 'emails', `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    try {
      await this.send('welcome', 'Welcome to the Natours Family!');
    } catch (err) {
      console.error('Email error:', err);
      // Continue without sending email
    }
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}

// const sendEmail = async options => {
// 	// 1) Create a transporter
// 	const transporter = nodemailer.createTransport({
// 		host: process.env.EMAIL_HOST,
// 		port: process.env.EMAIL_PORT,
// 		auth: {
// 			user: process.env.EMAIL_USERNAME,
// 			pass: process.env.EMAIL_PASSWORD
// 		}
// 	});

// 	// 2) Define the email options
// 	const mailOptions = {
// 		from: 'Andrew <hello@andrew.mail>',
// 		to: options.email,
// 		subject: options.subject,
// 		text: options.message
// 		// html:
// 	};

// 	// 3) Actually send the email
// 	await transporter.sendMail(mailOptions);
// }

// export default sendEmail;
