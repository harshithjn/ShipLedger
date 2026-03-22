// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShipmentRegistry {
    // 2. Define Enum
    enum Status {
        Created,
        Packaged,
        Verified,
        PickedUp,
        InTransit,
        Delivered
    }

    // 3. Define Shipment Struct
    struct Shipment {
        bytes32 shipmentId;        // unique identifier (hash-based)
        address sender;           // packaging staff wallet
        address carrier;          // assigned carrier wallet
        bytes32 specHash;         // hash of packaging specification (for integrity)
        string ipfsCID;           // IPFS content identifier for full spec
        Status status;            // current shipment status
        uint256 createdAt;        // timestamp of creation
        uint256 estimatedDelivery; // expected delivery timestamp
        bool isAuthentic;         // initially false, set true after verification
    }

    // 4. Storage Mapping
    mapping(bytes32 => Shipment) public shipments;

    // 6. Event
    event ShipmentCreated(bytes32 indexed shipmentId, address indexed sender, address indexed carrier);

    /**
     * @dev 5. createShipment Function
     * Generate a unique shipmentId using keccak256 hash of: msg.sender, block.timestamp, ipfsCID
     */
    function createShipment(
        address _carrier,
        bytes32 _specHash,
        string memory _ipfsCID,
        uint256 _estimatedDelivery
    ) public {
        // Generate unique shipmentId
        bytes32 _shipmentId = keccak256(abi.encodePacked(msg.sender, block.timestamp, _ipfsCID));

        // Ensure shipment does NOT already exist
        require(shipments[_shipmentId].createdAt == 0, "Shipment already exists");

        // Store a new Shipment struct
        shipments[_shipmentId] = Shipment({
            shipmentId: _shipmentId,
            sender: msg.sender,
            carrier: _carrier,
            specHash: _specHash,
            ipfsCID: _ipfsCID,
            status: Status.Created,
            createdAt: block.timestamp,
            estimatedDelivery: _estimatedDelivery,
            isAuthentic: false
        });

        // Emit ShipmentCreated event
        emit ShipmentCreated(_shipmentId, msg.sender, _carrier);
    }
}
