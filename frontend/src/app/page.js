import Hero from '@/components/Hero';
import Contributors from '@/components/Contributors';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      <Navbar />

      <Hero />
      
      <Contributors />

      <footer className="py-20 px-6 text-center border-t border-white/5">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em]">© 2026 ShipLedger Protocol</p>
      </footer>
    </main>
  );
}
