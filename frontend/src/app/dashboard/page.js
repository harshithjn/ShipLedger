import CreateShipment from '@/components/Dashboard/CreateShipment';
import VerifyShipment from '@/components/Dashboard/VerifyShipment';
import TrackShipment from '@/components/Dashboard/TrackShipment';
import UpdateStatus from '@/components/Dashboard/UpdateStatus';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      
      <div className="p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-[var(--border)] pb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Operations Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest text-[#999]">ShipLedger Nexus</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CreateShipment />
          <VerifyShipment />
          <TrackShipment />
          <UpdateStatus />
        </div>
      </div>

      <footer className="mt-20 py-8 border-t border-[var(--border)] flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-gray-600">
        <span>Region: Sepolia Testnet</span>
        <span>Connected: 0x... (Mock)</span>
      </footer>
    </main>
  );
}
