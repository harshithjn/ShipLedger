const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipmentRegistry", function () {
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
  const specIPFSCID = "QmPChv5d5G...CID";
  const estimatedDelivery = Math.floor(Date.now() / 1000) + 86400;

  beforeEach(async function () {
    [owner, packagingStaff, carrier, otherAccount] = await ethers.getSigners();
    ShipmentRegistry = await ethers.getContractFactory("ShipmentRegistry");
    shipmentRegistry = await ShipmentRegistry.deploy();

    // Assign roles
    await shipmentRegistry.grantRole(PACKAGING_STAFF_ROLE, packagingStaff.address);
    await shipmentRegistry.grantRole(CARRIER_ROLE, carrier.address);
  });

  describe("createShipment", function () {
    it("Should allow packaging staff to create a shipment", async function () {
      await expect(shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSCID,
        estimatedDelivery
      )).to.emit(shipmentRegistry, "ShipmentCreated")
        .withArgs(shipmentId, packagingStaff.address);

      const shipment = await shipmentRegistry.getShipment(shipmentId);
      expect(shipment.shipmentId).to.equal(shipmentId);
      expect(shipment.sender).to.equal(packagingStaff.address);
      expect(shipment.currentStatus).to.equal(0); // Created
    });

    it("Should fail if called by non-packaging staff", async function () {
      await expect(shipmentRegistry.connect(otherAccount).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSCID,
        estimatedDelivery
      )).to.be.revertedWithCustomError(shipmentRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should fail if shipmentId already exists", async function () {
      await shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSCID,
        estimatedDelivery
      );

      await expect(shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSCID,
        estimatedDelivery
      )).to.be.revertedWithCustomError(shipmentRegistry, "ShipmentAlreadyExists");
    });
  });

  describe("verifyShipment", function () {
    this.beforeEach(async function () {
      await shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSCID,
        estimatedDelivery
      );
    });

    it("Should verify shipment with correct hash", async function () {
      await expect(shipmentRegistry.verifyShipment(shipmentId, specHash))
        .to.emit(shipmentRegistry, "ShipmentVerified")
        .withArgs(shipmentId, any); // Use custom matcher or check below

      const shipment = await shipmentRegistry.getShipment(shipmentId);
      expect(shipment.isAuthentic).to.be.true;
      expect(shipment.currentStatus).to.equal(2); // Verified
    });

    it("Should fail with incorrect hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
      await expect(shipmentRegistry.verifyShipment(shipmentId, wrongHash))
        .to.be.revertedWithCustomError(shipmentRegistry, "InvalidHash");
    });
  });

  describe("updateStatus", function () {
    this.beforeEach(async function () {
      await shipmentRegistry.connect(packagingStaff).createShipment(
        shipmentId,
        carrier.address,
        specHash,
        specIPFSCID,
        estimatedDelivery
      );
    });

    it("Should allow carrier to update status sequentially", async function () {
      // Created -> Packaged
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, 1))
        .to.emit(shipmentRegistry, "StatusUpdated")
        .withArgs(shipmentId, 1, any);

      // Packaged -> Verified
      // Note: VerifyShipment also updates status to 2.
      await shipmentRegistry.verifyShipment(shipmentId, specHash);

      // Verified -> PickedUp
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, 3))
        .to.emit(shipmentRegistry, "StatusUpdated")
        .withArgs(shipmentId, 3, any);
    });

    it("Should fail if status transition skips steps", async function () {
      // Created -> Verified (skipping Packaged)
      await expect(shipmentRegistry.connect(carrier).updateStatus(shipmentId, 2))
        .to.be.revertedWithCustomError(shipmentRegistry, "InvalidStatusTransition");
    });

    it("Should fail if caller is not the carrier", async function () {
        await expect(shipmentRegistry.connect(otherAccount).updateStatus(shipmentId, 1))
        .to.be.revertedWithCustomError(shipmentRegistry, "AccessControlUnauthorizedAccount");
    });
  });
});

// Helper for 'any' matcher in ethers v6 if needed, or just focus on other args.
const any = (val) => true;
