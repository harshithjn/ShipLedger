# ShipLedger Protocol Test Data

Use these values to test the application features in the dashboard. Ensure your wallet is connected to the **Sepolia Testnet**.

## 1. Create Shipment
| Field | Value | Description |
|---|---|---|
| **Shipment ID** | `0x5348495030303100000000000000000000000000000000000000000000000000` | Hex for "SHIP001" |
| **Carrier** | `0x018a389eF1960A636Fbd135Bd7A72378a0b0fE77` | (Use your own address for testing) |
| **Spec Hash** | `0x6162636465666768696a6b6c6d6e6f707172737475767778797a313233343536` | Mock SHA-256 |
| **IPFS Hash** | `0x6261667962656967676767616161616161616161616161616161616161616161` | Mock IPFS CID in hex |
| **ETA (Unix)** | `1744123456` | Future timestamp |

---

## 2. Verify Shipment
| Field | Value | 
|---|---|
| **Shipment ID** | `0x5348495030303100000000000000000000000000000000000000000000000000` |
| **Spec Hash** | `0x6162636465666768696a6b6c6d6e6f707172737475767778797a313233343536` |

---

## 3. Track Shipment
| Field | Value |
|---|---|
| **Shipment ID** | `0x5348495030303100000000000000000000000000000000000000000000000000` |

---

## 4. Update Status
| Field | Value | Step |
|---|---|---|
| **Shipment ID** | `0x5348495030303100000000000000000000000000000000000000000000000000` | |
| **Status Index** | `2` | Verified |
| **Status Index** | `4` | In Transit |
| **Status Index** | `5` | Delivered |

> [!NOTE]
> For Status Update, ensure the connected wallet has the `CARRIER` or `STAFF` role if RBAC is enabled on the contract.
