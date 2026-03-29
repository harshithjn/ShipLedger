const fs = require('fs');
const path = require('path');

function main() {
  const artifactPath = path.join(__dirname, '../artifacts/contracts/ShipmentRegistry.sol/ShipmentRegistry.json');
  const sharedDirPath = path.join(__dirname, '../../shared/abis');
  const exportPath = path.join(sharedDirPath, 'ShipmentRegistry.json');

  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Artifact not found. Please compile the contract first by running 'npx hardhat compile'");
    process.exit(1);
  }

  // Create shared directory if it doesn't exist
  if (!fs.existsSync(sharedDirPath)) {
    fs.mkdirSync(sharedDirPath, { recursive: true });
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Export only the ABI
  fs.writeFileSync(exportPath, JSON.stringify(artifact.abi, null, 2));

  console.log(`✅ ABI exported successfully to: ${exportPath}`);
}

main();
