# Blockchain-Based Shipment Tracking System

A decentralized shipment tracking system using Ethereum smart contracts, IPFS, and a Node.js backend to ensure tamper-proof and verifiable logistics data.

---

## Overview

This project replaces centralized tracking with a **blockchain-backed system** where shipment data is immutable and shared across stakeholders.

- Critical data stored on-chain (hashes, status, ownership)
- Large and sensitive data stored off-chain (IPFS + PostgreSQL)
- Backend acts as a bridge between blockchain and real-world events (RFID/QR scans)

---

## Tech Stack

- **Blockchain**: Solidity, Ethereum (Sepolia), OpenZeppelin
- **Backend**: Node.js, Express, Ethers.js
- **Database**: PostgreSQL
- **Storage**: IPFS (Pinata/Web3.Storage)
- **Testing**: Hardhat

---

## Key Features

- Create shipment records with on-chain hashes
- Verify authenticity using hash comparison (`verifyShipment`)
- Role-based access control (staff vs carrier)
- Event-driven backend (listens to contract events instead of polling)
- IPFS integration for secure document storage

---

## Why This Project Stands Out

- Combines **blockchain + backend + distributed storage** (not just a contract demo)
- Implements **event-driven architecture using smart contract events**
- Optimized for real-world constraints (gas cost, no PII on-chain)

---

## Contributors

- Harshith J — https://github.com/harshithjn
- Nidhi Udupa — https://github.com/nidhin-eng
- Mohammed Bilal — https://github.com/bilalinbytes

---

## License

MIT License
