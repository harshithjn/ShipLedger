export const SHIPMENT_REGISTRY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "ShipmentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ShipmentVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint8", "name": "status", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "StatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "internalType": "address", "name": "carrier", "type": "address" },
      { "internalType": "bytes32", "name": "specHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "specIPFSHash", "type": "bytes32" },
      { "internalType": "uint40", "name": "estimatedDelivery", "type": "uint40" }
    ],
    "name": "createShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" }
    ],
    "name": "getShipment",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
          { "internalType": "bytes32", "name": "specHash", "type": "bytes32" },
          { "internalType": "bytes32", "name": "specIPFSHash", "type": "bytes32" },
          { "internalType": "address", "name": "sender", "type": "address" },
          { "internalType": "address", "name": "carrierAddress", "type": "address" },
          { "internalType": "uint40", "name": "createdAt", "type": "uint40" },
          { "internalType": "uint40", "name": "estimatedDelivery", "type": "uint40" },
          { "internalType": "uint8", "name": "currentStatus", "type": "uint8" },
          { "internalType": "bool", "name": "isAuthentic", "type": "bool" }
        ],
        "internalType": "struct ShipmentRegistry.Shipment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "internalType": "enum ShipmentRegistry.Status", "name": "newStatus", "type": "uint8" }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "shipmentId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "providedHash", "type": "bytes32" }
    ],
    "name": "verifyShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
