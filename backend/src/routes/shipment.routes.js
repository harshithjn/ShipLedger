const express = require('express');
const router = express.Router();
const { uploadSpec } = require('../services/ipfs.service');
const { createShipment, getShipment } = require('../services/blockchain.service');
const db = require('../db');

router.post('/shipment', async (req, res) => {
  try {
    const { itemDetails, carrierAddress, estimatedDelivery, packagingSpec, customerEmail } = req.body;

    // 1. Upload spec to IPFS and get CID + hash
    const { cid, specHash } = await uploadSpec(packagingSpec);

    // 2. Call smart contract
    const txHash = await createShipment(itemDetails, carrierAddress, estimatedDelivery, specHash, cid);

    // 3. Store meta in DB
    await db.query(
      'INSERT INTO shipment_meta (ipfs_cid, carrier_name, customer_email) VALUES ($1, $2, $3)',
      [cid, carrierAddress, customerEmail]
    );

    res.json({ success: true, txHash, cid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipment/:id', async (req, res) => {
  try {
    const shipment = await getShipment(req.params.id);
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;