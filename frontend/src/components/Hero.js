import Link from 'next/link';

export default function Hero() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter">
        Blockchain-Based Shipment Tracking System
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
        Transparent, tamper-proof shipment tracking powered by Ethereum and IPFS.
      </p>
      <Link href="/dashboard">
        <button className="text-lg px-10 py-4 flex items-center gap-2">
          Get In <span className="text-xl">→</span>
        </button>
      </Link>
    </section>
  );
}
