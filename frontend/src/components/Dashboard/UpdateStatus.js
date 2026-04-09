'use client';
import { useState } from 'react';
import { connectWallet, getContract, formatBytes32, parseError, isContractDeployed } from '@/lib/blockchain';
import Notification from '@/components/Notification';

const statusOptions = [
  { value: 1, label: 'Packaged' },
  { value: 2, label: 'Verified' },
  { value: 3, label: 'PickedUp' },
  { value: 4, label: 'InTransit' },
  { value: 5, label: 'Delivered' },
];

export default function UpdateStatus() {
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
        throw new Error('Smart Contract not detected at address. Verify CONTRACT_ADDRESS.');
      }
      const formData = new FormData(e.target);
      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.updateStatus(
        formatBytes32(formData.get('shipmentId')),
        Number(formData.get('status'))
      );

      setTxHash(tx.hash);
      await tx.wait();
      setNotification({ message: 'Status Updated Successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setNotification({ message: parseError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 border border-[var(--border)] bg-[var(--muted)] relative">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />

      <h2 className="text-xl font-bold uppercase mb-6 tracking-tighter">4. Update Status (Carrier)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase text-gray-500 mb-1 block">Shipment ID</label>
          <input name="shipmentId" type="text" placeholder="0x..." required />
        </div>
        <div>
          <label className="text-xs uppercase text-gray-500 mb-1 block">New Status</label>
          <select name="status" className="appearance-none font-matter" required>
            <option value="">Select Status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full disabled:opacity-50" disabled={loading}>
          {loading ? 'Updating...' : 'Update Status'}
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
