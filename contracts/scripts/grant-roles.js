const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0x14Eb2CeDec3E2543edC492Fd6d31744dC5Db2A50";
    const USER_WALLET = "0x2aA13fA473696A4865b2eDF2Ab576189ffeA8389"; // Your browser wallet

    const [admin] = await hre.ethers.getSigners();
    console.log("Using Admin account:", admin.address);

    const contract = await hre.ethers.getContractAt("ShipmentRegistry", CONTRACT_ADDRESS);

    // Define Roles
    const PACKAGING_STAFF_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("PACKAGING_STAFF_ROLE"));
    const CARRIER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("CARRIER_ROLE"));

    console.log("Granting PACKAGING_STAFF_ROLE...");
    const tx1 = await contract.grantRole(PACKAGING_STAFF_ROLE, USER_WALLET);
    await tx1.wait();
    console.log("✅ Granted PACKAGING_STAFF_ROLE to", USER_WALLET);

    console.log("Granting CARRIER_ROLE...");
    const tx2 = await contract.grantRole(CARRIER_ROLE, USER_WALLET);
    await tx2.wait();
    console.log("✅ Granted CARRIER_ROLE to", USER_WALLET);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
