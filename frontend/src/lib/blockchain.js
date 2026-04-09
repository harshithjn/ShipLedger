import { ethers } from 'ethers';
import { SHIPMENT_REGISTRY_ABI } from '../config/abi';
import { CONTRACT_ADDRESS, RPC_URL, FALLBACK_RPC_URL } from '../config/contract';

export const getProvider = (useFallback = false) => {
  return new ethers.JsonRpcProvider(useFallback ? FALLBACK_RPC_URL : RPC_URL);
};

export const getContract = (signerOrProvider) => {
  if (signerOrProvider) {
    return new ethers.Contract(CONTRACT_ADDRESS, SHIPMENT_REGISTRY_ABI, signerOrProvider);
  }
  
  // Use BrowserProvider if available (MetaMask), otherwise fallback to JsonRpc
  if (typeof window !== 'undefined' && window.ethereum) {
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, SHIPMENT_REGISTRY_ABI, browserProvider);
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, SHIPMENT_REGISTRY_ABI, getProvider());
};

export const isContractDeployed = async () => {
  try {
    const provider = getProvider();
    const code = await provider.getCode(CONTRACT_ADDRESS);
    return code !== '0x' && code !== '0x0';
  } catch (e) {
    console.error('Check failed:', e);
    return false;
  }
};

export const fetchRealBlockchainEvents = async () => {
  const provider = getProvider();
  const contract = getContract(provider);
  
  try {
    // Fetch last 1000 blocks worth of events
    const latestBlock = await provider.getBlockNumber();
    const latestBlockBI = BigInt(latestBlock);
    const fromBlock = latestBlockBI - 1000n > 0n ? latestBlockBI - 1000n : 0n;

    const [createdEvents, verifiedEvents, updatedEvents] = await Promise.all([
      contract.queryFilter('ShipmentCreated', fromBlock, 'latest'),
      contract.queryFilter('ShipmentVerified', fromBlock, 'latest'),
      contract.queryFilter('StatusUpdated', fromBlock, 'latest')
    ]);

    // Combine and sort by block number/transaction index
    const allEvents = [
      ...createdEvents.map(e => ({ type: 'ShipmentCreated', blockNumber: e.blockNumber, hash: e.transactionHash })),
      ...verifiedEvents.map(e => ({ type: 'ShipmentVerified', blockNumber: e.blockNumber, hash: e.transactionHash })),
      ...updatedEvents.map(e => ({ type: 'StatusUpdated', blockNumber: e.blockNumber, hash: e.transactionHash }))
    ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

    // Group into "Blocks" without calling getBlock (saves RPC units)
    const blocksMap = {};
    for (const event of allEvents) {
      const bNum = Number(event.blockNumber);
      if (!blocksMap[bNum]) {
        blocksMap[bNum] = {
          number: bNum,
          timestamp: 'RECENT', // Don't fetch every block timestamp to avoid rate limits
          transactions: []
        };
      }
      if (blocksMap[bNum].transactions.length < 5) { // Limit transactions per block in UI
        blocksMap[bNum].transactions.push({
          event: event.type,
          hash: event.hash
        });
      }
    }

    return Object.values(blocksMap).sort((a, b) => b.number - a.number).slice(0, 5);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    if (err.message?.includes('Too Many Requests') || err.info?.message?.includes('Too Many Requests')) {
      throw new Error('RPC Rate Limit reached. Please wait 10 seconds.');
    }
    if (err.code === 'BAD_DATA') {
      throw new Error('Contract data error. Verify your CONTRACT_ADDRESS.');
    }
    throw err;
  }
};

export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if network is Sepolia (Chain ID 11155111)
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } else {
          throw switchError;
        }
      }
    }

    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return { provider, signer };
  }
  throw new Error("No crypto wallet found");
};

export const formatBytes32 = (hex) => {
  if (!hex) return ethers.ZeroHash;
  try {
    let cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    // Validate character set (hex only)
    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
      throw new Error('NOT_HEX');
    }

    // Validate length (must not exceed 32 bytes / 64 characters)
    if (cleanHex.length > 64) {
      throw new Error('TOO_LONG');
    }

    // Pad to even length if odd (e.g., '1' -> '01')
    if (cleanHex.length % 2 !== 0) {
      cleanHex = '0' + cleanHex;
    }
    
    return ethers.zeroPadValue('0x' + cleanHex, 32);
  } catch (e) {
    if (e.message === 'NOT_HEX') throw new Error('Invalid characters: Not a valid hex string.');
    if (e.message === 'TOO_LONG') throw new Error('Value is too long: Maximum 32 bytes (64 hex characters) allowed.');
    throw new Error('Format failed: ' + e.message);
  }
};

export const parseError = (err) => {
  // Handle our custom validation errors from formatBytes32
  if (err.message?.includes('Invalid characters') || err.message?.includes('Value is too long') || err.message?.includes('Format failed')) {
    return err.message;
  }

  if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
    return 'Transaction rejected by user.';
  }
  if (err.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction.';
  }
  if (err.message?.includes('ShipmentAlreadyExists')) {
    return 'Error: This Shipment ID already exists.';
  }
  if (err.message?.includes('Unauthorized') || err.message?.includes('AccessControl')) {
    return 'Error: You do not have the required role for this action.';
  }
  if (err.code === 'INVALID_ARGUMENT') {
    return `Invalid argument: ${err.message.split(' (')[0]}`;
  }
  return err.reason || err.message || 'An unknown error occurred.';
};
