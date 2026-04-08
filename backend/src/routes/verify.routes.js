const express = require('express');
const router = express.Router();
const { verifyShipment } = require('../services/blockchain.service');

router.post('/verify', async (req, res) => {
  try {
    const { shipmentId, itemHash } = req.body;
    const txHash = await verifyShipment(shipmentId, itemHash);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;