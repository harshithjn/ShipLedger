'use client';

import { useEffect, useState } from 'react';
import BlockCard from '@/components/Blockchain/BlockCard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { fetchRealBlockchainEvents } from '@/lib/blockchain';

export default function BlockchainPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const realBlocks = await fetchRealBlockchainEvents();
        setBlocks(realBlocks);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      <Navbar />
      
      <div className="p-6 md:p-12">
        <header className="mb-16 border-b border-[var(--border)] pb-8">
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">Network Visualization</h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Every shipment action is recorded as a transaction on the blockchain. These transactions are grouped into blocks, forming an immutable chain of custody.
          </p>
        </header>

      <section className="mb-20">
        <h2 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-8 font-medium">Live Ledger Stream (Real-Time)</h2>
        <div className="flex gap-6 overflow-x-auto pb-8 mask-gradient scrollbar-hide">
          {loading ? (
            <div className="p-12 text-zinc-500 uppercase tracking-widest text-xs animate-pulse">
              Syncing with Sepolia Network...
            </div>
          ) : blocks.length > 0 ? (
            blocks.map((block) => (
              <BlockCard key={block.number} {...block} />
            ))
          ) : (
            <div className="p-12 text-zinc-500 uppercase tracking-widest text-xs">
              No recent events found.
            </div>
          )}
          <div className="min-w-[300px] border border-dashed border-[var(--border)] flex items-center justify-center text-zinc-800 text-xs uppercase tracking-widest italic">
            Waiting for next block...
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-t border-[var(--border)]">
        <div>
          <h3 className="text-lg font-bold uppercase mb-4 tracking-tighter">Why Immutable?</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Blockchain uses cryptographic hashing to link blocks. Altering a single transaction would require re-calculating every subsequent block, making fraud computationally impossible.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold uppercase mb-4 tracking-tighter">Hash Storage</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            By storing document hashes (SHA-256) instead of raw data, we ensure privacy and efficiency while maintaining 100% verifiability of technical specifications.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold uppercase mb-4 tracking-tighter">Verification Logic</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Smart contracts automatically validate identity (RBAC) and state transitions, ensuring that only authorized carriers can update shipment status.
          </p>
        </div>
      </section>

      <section className="mt-20 p-12 border border-[var(--border)] bg-[var(--muted)]">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-6">Integration Status</h2>
        <div className="space-y-4 font-mono text-[10px]">
          <div className="flex gap-4">
            <span className="text-green-500">[LIVE]</span>
            <span className="text-zinc-500">Fetching real-time events from 0xF639...D1</span>
          </div>
          <div className="flex gap-4">
            <span className="text-green-500">[CONNECTED]</span>
            <span className="text-zinc-500">Etherum Provider: Infura Sepolia</span>
          </div>
          <div className="flex gap-4">
            <span className="text-green-500">[READY]</span>
            <span className="text-zinc-500">Visualization Engine Initialized</span>
          </div>
        </div>
      </section>

      <footer className="mt-24 text-center">
        <Link href="/">
           <span className="text-[10px] uppercase tracking-[0.5em] text-gray-700 hover:text-white cursor-pointer transition-colors">
             SHIPLEDGER PROTOCOL v1.0.0
           </span>
        </Link>
      </footer>
      </div>
    </main>
  );
}
