const { ethers } = require('ethers');
require('dotenv').config();

const uploadSpec = async (specJson) => {
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_SECRET
    },
    body: JSON.stringify({
      pinataContent: specJson,
      pinataMetadata: { name: 'packaging-spec' }
    })
  });

  const data = await response.json();
  const cid = data.IpfsHash;

  const specHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(specJson)));

  return { cid, specHash };
};

module.exports = { uploadSpec };