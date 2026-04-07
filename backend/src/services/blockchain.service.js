const { ethers } = require('ethers');
require('dotenv').config();

const { abi } = require('../../../shared/abi/ShipmentRegistry.json');

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

const createShipment = async (itemDetails, carrierAddress, estimatedDelivery, specHash, specIPFSCID) => {
  const tx = await contract.createShipment(
    itemDetails,
    carrierAddress,
    estimatedDelivery,
    specHash,
    specIPFSCID
  );
  await tx.wait();
  return tx.hash;
};

const getShipment = async (shipmentId) => {
  const shipment = await contract.getShipment(shipmentId);
  return shipment;
};

const verifyShipment = async (shipmentId, itemHash) => {
  const tx = await contract.verifyShipment(shipmentId, itemHash);
  await tx.wait();
  return tx.hash;
};

module.exports = { createShipment, getShipment, verifyShipment };