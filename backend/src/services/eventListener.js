const { ethers } = require('ethers');
const notificationService = require('./NotificationService');
const pool = require('../db/connection');
const abi = require('../shared/abi.json').abi;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const WS_RPC_URL = process.env.INFURA_WS_URL || 
                process.env.INFURA_URL?.replace('https://', 'wss://').replace('/v3/', '/ws/v3/');

class EventListener {
  constructor() {
    this.provider = null;
    this.contract = null;
  }

  async start() {
    if (!WS_RPC_URL) {
      console.error('WebSocket RPC URL missing. Event listener cannot start.');
      return;
    }

    this.connect();
  }

  connect() {
    console.log('Connecting to blockchain via WebSocket...');
    this.provider = new ethers.WebSocketProvider(WS_RPC_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, this.provider);

    this.setupListeners();

    // Handle disconnection
    this.provider._websocket.on('close', () => {
      console.warn('WebSocket disconnected. Reconnecting in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    });

    this.provider._websocket.on('error', (err) => {
      console.error('WebSocket Error:', err.message);
    });
  }

  setupListeners() {
    console.log('Listening for on-chain events...');

    // 1. ShipmentVerified Event
    this.contract.on('ShipmentVerified', async (shipmentId, timestamp, event) => {
      console.log(`Event: ShipmentVerified | ID: ${shipmentId}`);
      await this.handleNotification(shipmentId, 'ShipmentVerified', 'Your shipment has been verified');
    });

    // 2. StatusUpdated Event
    this.contract.on('StatusUpdated', async (shipmentId, status, timestamp, event) => {
      console.log(`Event: StatusUpdated | ID: ${shipmentId} | Status: ${status}`);
      
      const statusMap = {
        1: 'Your order has been packaged',
        2: 'Your shipment has been verified',
        3: 'Your shipment has been picked up',
        4: 'Your shipment is in transit',
        5: 'Your shipment has been delivered'
      };

      const message = statusMap[Number(status)];
      if (message) {
        await this.handleNotification(shipmentId, `Status_${status}`, message);
      }
    });
  }

  async handleNotification(shipmentId, eventType, message) {
    try {
      // 1. Fetch customer email from DB
      const res = await pool.query('SELECT customer_email FROM shipment_meta WHERE shipment_id = $1', [shipmentId]);
      
      if (res.rows.length === 0) {
        console.warn(`No metadata found for shipment ${shipmentId}. Skipping notification.`);
        return;
      }

      const email = res.rows[0].customer_email;

      // 2. Prevent Duplicate Notifications (Optional but recommended)
      const existing = await pool.query(
        'SELECT id FROM notifications WHERE shipment_id = $1 AND event_type = $2',
        [shipmentId, eventType]
      );
      if (existing.rows.length > 0) {
        console.log(`Duplicate notification for ${shipmentId} ignored.`);
        return;
      }

      // 3. Trigger Email
      await notificationService.sendEmail(email, 'Shipment Update - ShipLedger', message);

      // 4. Log to DB
      await notificationService.logNotification(shipmentId, eventType);

    } catch (error) {
      console.error('Error handling notification:', error.message);
    }
  }
}

module.exports = new EventListener();
