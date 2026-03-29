// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ShipmentRegistry
 * @dev Production-ready shipment tracking contract with RBAC and status validation.
 */
contract ShipmentRegistry is AccessControl {
    // Roles
    bytes32 public constant PACKAGING_STAFF_ROLE = keccak256("PACKAGING_STAFF_ROLE");
    bytes32 public constant CARRIER_ROLE = keccak256("CARRIER_ROLE");

    // Enums
    enum Status {
        Created,
        Packaged,
        Verified,
        PickedUp,
        InTransit,
        Delivered
    }

    // Structs
    struct Shipment {
        bytes32 shipmentId;
        address sender;
        address carrierAddress;

        bytes32 specHash;
        string specIPFSCID;

        uint8 currentStatus;
        uint256 createdAt;
        uint256 estimatedDelivery;

        bool isAuthentic;
    }

    mapping(bytes32 => Shipment) public shipments;

    // Events
    event ShipmentCreated(bytes32 shipmentId, address sender);
    event ShipmentVerified(bytes32 shipmentId, uint256 timestamp);
    event StatusUpdated(bytes32 shipmentId, uint8 status, uint256 timestamp);

    // Errors
    error ShipmentAlreadyExists();
    error ShipmentNotFound();
    error Unauthorized();
    error InvalidStatusTransition();
    error InvalidHash();

    /**
     * @dev Constructor grants DEFAULT_ADMIN_ROLE to the deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new shipment.
     * Only PACKAGING_STAFF_ROLE can call this.
     */
    function createShipment(
        bytes32 shipmentId,
        address carrier,
        bytes32 specHash,
        string memory specIPFSCID,
        uint256 estimatedDelivery
    ) external onlyRole(PACKAGING_STAFF_ROLE) {
        if (shipments[shipmentId].createdAt != 0) {
            revert ShipmentAlreadyExists();
        }

        shipments[shipmentId] = Shipment({
            shipmentId: shipmentId,
            sender: msg.sender,
            carrierAddress: carrier,
            specHash: specHash,
            specIPFSCID: specIPFSCID,
            currentStatus: uint8(Status.Created),
            createdAt: block.timestamp,
            estimatedDelivery: estimatedDelivery,
            isAuthentic: false
        });

        emit ShipmentCreated(shipmentId, msg.sender);
    }

    /**
     * @dev Returns shipment details.
     */
    function getShipment(bytes32 shipmentId) external view returns (Shipment memory) {
        if (shipments[shipmentId].createdAt == 0) {
            revert ShipmentNotFound();
        }
        return shipments[shipmentId];
    }

    /**
     * @dev Verifies a shipment using a provided specification hash.
     * If valid, sets isAuthentic to true and updates status to Verified.
     */
    function verifyShipment(bytes32 shipmentId, bytes32 providedHash) external {
        if (shipments[shipmentId].createdAt == 0) {
            revert ShipmentNotFound();
        }

        Shipment storage shipment = shipments[shipmentId];

        if (providedHash != shipment.specHash) {
            revert InvalidHash();
        }

        // Validate state transition (optional but recommended)
        // Verified usually happens after Created/Packaged
        if (shipment.currentStatus > uint8(Status.Verified)) {
            revert InvalidStatusTransition();
        }

        shipment.isAuthentic = true;
        shipment.currentStatus = uint8(Status.Verified);

        emit ShipmentVerified(shipmentId, block.timestamp);
        emit StatusUpdated(shipmentId, uint8(Status.Verified), block.timestamp);
    }

    /**
     * @dev Updates the status of a shipment.
     * Only CARRIER_ROLE can call this.
     * Enforces sequential status transitions.
     */
    function updateStatus(bytes32 shipmentId, Status newStatus) external onlyRole(CARRIER_ROLE) {
        if (shipments[shipmentId].createdAt == 0) {
            revert ShipmentNotFound();
        }

        Shipment storage shipment = shipments[shipmentId];
        uint8 current = shipment.currentStatus;
        uint8 next = uint8(newStatus);

        // Enforce valid transitions:
        // Created → Packaged → Verified → PickedUp → InTransit → Delivered
        if (next != current + 1) {
            revert InvalidStatusTransition();
        }

        shipment.currentStatus = next;

        emit StatusUpdated(shipmentId, next, block.timestamp);
    }
}
