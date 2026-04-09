'use client';
import { useState } from 'react';
import { connectWallet, getContract, formatBytes32, parseError, isContractDeployed } from '@/lib/blockchain';
import Notification from '@/components/Notification';

export default function CreateShipment() {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const deployed = await isContractDeployed();
      if (!deployed) {
        throw new Error('Smart Contract not detected on Sepolia. Verify CONTRACT_ADDRESS.');
      }
      const formData = new FormData(e.target);
      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.createShipment(
        formatBytes32(formData.get('shipmentId')),
        formData.get('carrier'),
        formatBytes32(formData.get('specHash')),
        formatBytes32(formData.get('specIPFSHash')),
        formData.get('estimatedDelivery')
      );

      setTxHash(tx.hash);
      await tx.wait();
      setNotification({ message: 'Shipment Created Successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setNotification({ message: parseError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 border border-[var(--border)] relative">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />

      <h2 className="text-xl font-bold uppercase mb-6 tracking-tighter">1. Create Shipment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase text-gray-500 mb-1 block">Shipment ID (Hex)</label>
          <input name="shipmentId" type="text" placeholder="0x..." required />
        </div>
        <div>
          <label className="text-xs uppercase text-gray-500 mb-1 block">Carrier Address</label>
          <input name="carrier" type="text" placeholder="0x..." required />
        </div>
        <div>
          <label className="text-xs uppercase text-gray-500 mb-1 block">Estimated Delivery (Unix)</label>
          <input name="estimatedDelivery" type="number" placeholder="1744123456" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="text-xs uppercase text-gray-500 mb-1 block">Spec Hash</label>
             <input name="specHash" type="text" placeholder="0x..." required />
           </div>
           <div>
             <label className="text-xs uppercase text-gray-500 mb-1 block">IPFS Hash</label>
             <input name="specIPFSHash" type="text" placeholder="0x..." required />
           </div>
        </div>
        <button type="submit" className="w-full disabled:opacity-50" disabled={loading}>
          {loading ? 'Processing...' : 'Create Shipment'}
        </button>
        {txHash && (
          <p className="text-[10px] text-zinc-500 mt-2 break-all font-mono">
            TX: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="underline">{txHash}</a>
          </p>
        )}
      </form>
    </div>
  );
}
