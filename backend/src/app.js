const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const shipmentRoutes = require('./routes/shipment.routes');
const verifyRoutes = require('./routes/verify.routes');

app.use('/api', shipmentRoutes);
app.use('/api', verifyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start Blockchain Event Listener
    const eventListener = require('./services/eventListener');
    eventListener.start().catch(err => console.error('Failed to start Event Listener:', err));
});

module.exports = app;