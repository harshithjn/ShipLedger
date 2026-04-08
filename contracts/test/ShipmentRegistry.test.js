const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipmentRegistry Comprehensive Tests", function () {
  let ShipmentRegistry;
  let shipmentRegistry;
  let owner;
  let packagingStaff;
  let carrier;
  let otherAccount;

  const PACKAGING_STAFF_ROLE = ethers.id("PACKAGING_STAFF_ROLE");
  const CARRIER_ROLE = ethers.id("CARRIER_ROLE");

  const shipmentId = ethers.keccak256(ethers.toUtf8Bytes("shipment123"));
  const specHash = ethers.keccak256(ethers.toUtf8Bytes("specifications"));
  const specIPFSHash = ethers.keccak256(ethers.toUtf8Bytes("QmPChv5d5G...CID"));
  const estimatedDelivery = Math.floor(Date.now() / 1000) + 86400;

  // Status Enum mapping
  const Status = {
    Created: 0,
    Packaged: 1,
    Verified: 2,
    PickedUp: 3,
    InTransit: 4,
    Delivered: 5
  };

  beforeEach(async function () {
    [owner, packagingStaff, carrier, otherAccount] = await ethers.getSigners();
    ShipmentRegistry = await ethers.getContractFactory("ShipmentRegistry");
    shipmentRegistry = await ShipmentRegistry.deploy();

    await shipmentRegistry.grantRole(PACKAGING_STAFF_ROLE, packagingStaff.address);
    await shipmentRegistry.grantRole(CARRIER_ROLE, carrier.address);
  });

  describe("1. createShipment()", function () {
    it("Success: Should allow packaging staff to create a shipment", async function () {
      await expect(shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSHash,
        estimatedDelivery
      )).to.emit(shipmentRegistry, "ShipmentCreated")
        .withArgs(shipmentId, packagingStaff.address);

      const s = await shipmentRegistry.getShipment(shipmentId);
      expect(s.shipmentId).to.equal(shipmentId);
      expect(s.sender).to.equal(packagingStaff.address);
      expect(s.carrierAddress).to.equal(carrier.address);
      expect(s.specHash).to.equal(specHash);
      expect(s.specIPFSHash).to.equal(specIPFSHash);
      expect(s.currentStatus).to.equal(Status.Created);
      expect(s.isAuthentic).to.be.false;
    });

    it("Failure: Unauthorized user (owner) cannot create shipment", async function () {
      await expect(shipmentRegistry.connect(owner).createShipment(
        shipmentId, carrier.address, specHash, specIPFSHash, estimatedDelivery
      )).to.be.revertedWithCustomError(shipmentRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Failure: Carrier cannot create shipment", async function () {
      await expect(shipmentRegistry.connect(carrier).createShipment(
        shipmentId, carrier.address, specHash, specIPFSHash, estimatedDelivery
      )).to.be.revertedWithCustomError(shipmentRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Failure: Duplicate shipmentId", async function () {
      await shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId, carrier.address, specHash, specIPFSHash, estimatedDelivery
      );
      await expect(shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId, carrier.address, specHash, specIPFSHash, estimatedDelivery
      )).to.be.revertedWithCustomError(shipmentRegistry, "ShipmentAlreadyExists");
    });
  });

  describe("2. verifyShipment()", function () {
    beforeEach(async function () {
      await shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId, carrier.address, specHash, specIPFSHash, estimatedDelivery
      );
    });

    it("Success: Verify with correct hash", async function () {
      await expect(shipmentRegistry.verifyShipment(shipmentId, specHash))
        .to.emit(shipmentRegistry, "ShipmentVerified")
        .to.emit(shipmentRegistry, "StatusUpdated")
        .withArgs(shipmentId, Status.Verified, (val) => true);

      const s = await shipmentRegistry.getShipment(shipmentId);
      expect(s.isAuthentic).to.be.true;
      expect(s.currentStatus).to.equal(Status.Verified);
    });

    it("Failure: Wrong hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
      await expect(shipmentRegistry.verifyShipment(shipmentId, wrongHash))
        .to.be.revertedWithCustomError(shipmentRegistry, "InvalidHash");
    });

    it("Failure: Non-existent shipment", async function () {
      const ghostId = ethers.keccak256(ethers.toUtf8Bytes("ghost"));
      await expect(shipmentRegistry.verifyShipment(ghostId, specHash))
        .to.be.revertedWithCustomError(shipmentRegistry, "ShipmentNotFound");
    });

    it("Idempotency: Calling verifyShipment again", async function () {
        await shipmentRegistry.verifyShipment(shipmentId, specHash);
        // Second call should still work as it sets isAuthentic=true and currentStatus=Verified
        // But if the transition logic in verifyShipment says `shipment.currentStatus > uint8(Status.Verified)` revert
        // Then it should BE fine because Verified is not > Verified.
        await expect(shipmentRegistry.verifyShipment(shipmentId, specHash))
            .to.emit(shipmentRegistry, "ShipmentVerified");
    });

    it("Failure: Verify after higher status (e.g. Delivered)", async function () {
        // Move to Packaged
        await shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Packaged);
        // Move to Verified (via verify)
        await shipmentRegistry.verifyShipment(shipmentId, specHash);
        // Move to PickedUp
        await shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.PickedUp);
        
        // Now try to verify again - should fail because status is now PickedUp (3) > Verified (2)
        await expect(shipmentRegistry.verifyShipment(shipmentId, specHash))
            .to.be.revertedWithCustomError(shipmentRegistry, "InvalidStatusTransition");
    });
  });

  describe("3. updateStatus()", function () {
    beforeEach(async function () {
      await shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId, carrier.address, specHash, specIPFSHash, estimatedDelivery
      );
    });

    it("Success: Full sequential flow", async function () {
      // Created -> Packaged
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Packaged))
        .to.emit(shipmentRegistry, "StatusUpdated").withArgs(shipmentId, Status.Packaged, (v) => true);
      
      // Packaged -> Verified (Via verifyShipment)
      await shipmentRegistry.verifyShipment(shipmentId, specHash);
      
      // Verified -> PickedUp
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.PickedUp))
        .to.emit(shipmentRegistry, "StatusUpdated").withArgs(shipmentId, Status.PickedUp, (v) => true);
        
      // PickedUp -> InTransit
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.InTransit))
        .to.emit(shipmentRegistry, "StatusUpdated").withArgs(shipmentId, Status.InTransit, (v) => true);
        
      // InTransit -> Delivered
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Delivered))
        .to.emit(shipmentRegistry, "StatusUpdated").withArgs(shipmentId, Status.Delivered, (v) => true);
    });

    it("Failure: Skip status (Created -> Verified)", async function () {
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Verified))
        .to.be.revertedWithCustomError(shipmentRegistry, "InvalidStatusTransition");
    });

    it("Failure: Repeat status (Packaged -> Packaged)", async function () {
      await shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Packaged);
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Packaged))
        .to.be.revertedWithCustomError(shipmentRegistry, "InvalidStatusTransition");
    });

    it("Failure: Backward status (Packaged -> Created)", async function () {
        await shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Packaged);
        await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, Status.Created))
          .to.be.revertedWithCustomError(shipmentRegistry, "InvalidStatusTransition");
    });

    it("Failure: Unauthorized role (Packaging Staff)", async function () {
        await expect(shipmentRegistry.connect(packagingStaff).updateStatus(shipmentId, Status.Packaged))
          .to.be.revertedWithCustomError(shipmentRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Failure: Non-existent shipment", async function () {
        const ghostId = ethers.keccak256(ethers.toUtf8Bytes("ghost"));
        await expect(shipmentRegistry.connect(carrier).updateStatus(ghostId, Status.Packaged))
          .to.be.revertedWithCustomError(shipmentRegistry, "ShipmentNotFound");
    });
  });

  describe("4. getShipment()", function () {
      it("Failure: Non-existent shipment", async function () {
        const ghostId = ethers.keccak256(ethers.toUtf8Bytes("ghost"));
        await expect(shipmentRegistry.getShipment(ghostId))
          .to.be.revertedWithCustomError(shipmentRegistry, "ShipmentNotFound");
      });
  });
});
