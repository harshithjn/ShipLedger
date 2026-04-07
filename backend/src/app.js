const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const shipmentRoutes = require('./routes/shipment.routes');
const verifyRoutes = require('./routes/verify.routes');

app.use('/api', shipmentRoutes);
app.use('/api', verifyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;