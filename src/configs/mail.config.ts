import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from './env.config';

export const MAIL_CONFIG: SMTPTransport | SMTPTransport.Options | string = {
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: env.MAIL_USER,
		pass: env.MAIL_PASSWORD
	}
};
