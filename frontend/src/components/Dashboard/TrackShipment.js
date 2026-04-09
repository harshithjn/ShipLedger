'use client';
import { useState } from 'react';
import { getContract, formatBytes32, isContractDeployed, parseError } from '@/lib/blockchain';
import Notification from '@/components/Notification';

const steps = ['Created', 'Packaged', 'Verified', 'PickedUp', 'InTransit', 'Delivered'];

export default function TrackShipment() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [shipmentId, setShipmentId] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleTrack = async () => {
    if (!shipmentId) {
      setNotification({ message: 'Please enter a Shipment ID', type: 'info' });
      return;
    }
    setLoading(true);
    setCurrentStep(-1);
    setNotification({ message: '', type: '' });
    
    try {
      const deployed = await isContractDeployed();
      if (!deployed) {
        throw new Error('Critical Error: Smart Contract not detected at the configured address on Sepolia. Please verify your deployment and CONTRACT_ADDRESS.');
      }

      const contract = getContract();
      const formattedId = formatBytes32(shipmentId);
      
      const shipment = await contract.getShipment(formattedId);
      
      if (!shipment || shipment.createdAt === 0n) {
        throw new Error('Shipment not found on-chain.');
      }
      
      setCurrentStep(Number(shipment.currentStatus));
      setNotification({ message: 'Tracking data retrieved successfully!', type: 'success' });
    } catch (err) {
      console.error('Tracking Error:', err);
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

      <h2 className="text-xl font-bold uppercase mb-6 tracking-tighter">3. Track Shipment</h2>
      <div className="space-y-6">
        <div>
          <label className="text-xs uppercase text-gray-500 mb-1 block">Shipment ID</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="0x..." 
              className="flex-1" 
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
            />
            <button className="px-6 disabled:opacity-50" onClick={handleTrack} disabled={loading}>
              {loading ? '...' : 'Track'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <label className="text-xs uppercase text-gray-500 mb-4 block">Status Timeline (On-Chain)</label>
          <div className="relative flex justify-between items-center w-full">
            <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--border)] -z-10"></div>
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-3 h-3 border ${index <= currentStep ? 'bg-[var(--foreground)] border-[var(--foreground)]' : 'bg-[var(--background)] border-[var(--border)]'} transition-colors duration-500`}
                ></div>
                <span className={`text-[10px] uppercase mt-2 tracking-tighter ${index <= currentStep ? 'text-[var(--foreground)]' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
