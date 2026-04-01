const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts to", hre.network.name, "with the account:", deployer.address);

  const ShipmentRegistry = await hre.ethers.getContractFactory("ShipmentRegistry");
  const shipmentRegistry = await ShipmentRegistry.deploy();

  await shipmentRegistry.waitForDeployment();
  const address = await shipmentRegistry.getAddress();

  console.log("✅ ShipmentRegistry deployed to:", address);

  // Auto-export the ABI right after deployment
  const artifactPath = path.join(__dirname, '../artifacts/contracts/ShipmentRegistry.sol/ShipmentRegistry.json');
  const sharedDirPath = path.join(__dirname, '../../shared/abis');
  
  if (!fs.existsSync(sharedDirPath)) {
    fs.mkdirSync(sharedDirPath, { recursive: true });
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const exportPath = path.join(sharedDirPath, 'ShipmentRegistry.json');
  
  fs.writeFileSync(exportPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`✅ ABI exported successfully to: ${exportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
