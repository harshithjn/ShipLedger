const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const pool = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const twilioClient = process.env.TWILIO_SID ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) : null;

class NotificationService {
  /**
   * Sends an email notification via SendGrid.
   */
  async sendEmail(to, subject, text) {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API Key missing. Skipping email.');
      return;
    }
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      text,
    };
    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('SendGrid Error:', error.response ? error.response.body : error.message);
    }
  }

  /**
   * Sends an SMS notification via Twilio.
   */
  async sendSMS(to, message) {
    if (!twilioClient) {
      console.warn('Twilio credentials missing. Skipping SMS.');
      return;
    }
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to,
      });
      console.log(`SMS sent to ${to}`);
    } catch (error) {
      console.error('Twilio Error:', error.message);
    }
  }

  /**
   * Logs the notification in the database.
   */
  async logNotification(shipmentId, eventType) {
    const query = `
      INSERT INTO notifications (id, shipment_id, event_type, sent_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `;
    const values = [uuidv4(), shipmentId, eventType];
    try {
      await pool.query(query, values);
      console.log(`Notification logged: ${eventType} for ${shipmentId}`);
    } catch (error) {
      console.error('DB Log Error:', error.message);
    }
  }
}

module.exports = new NotificationService();
