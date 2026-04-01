# Data Architecture & Database Schema

## Goal of this document
Clearly define:
1. What goes ON-CHAIN
2. What goes OFF-CHAIN
3. Why

This document is a contract between you and Nidhi

## On-Chain Data (Ethereum)
Include only:
● shipmentId (bytes32)
● sender (address)
● carrierAddress (address)
● specHash (bytes32)
● specIPFSCID (string)
● currentStatus (uint8 enum)
● createdAt (timestamp)
● estimatedDelivery (timestamp)
● isAuthentic (bool)

## Off-Chain Data (PostgreSQL)
Include:
● User personal data (PII)
● Shipment metadata for UI
● Notification logs

### Critical Rule
NO PII on blockchain (emails, phone, names)

## Explanation Section
Explain WHY:
● Blockchain stores hashes → immutability
● DB stores full data → flexibility + compliance
