'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-[var(--border)] py-4 px-8 flex justify-between items-center sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-50 transition-colors duration-300">
      <Link href="/">
        <h2 className="font-bold tracking-tighter text-xl cursor-pointer">SHIPLEDGER</h2>
      </Link>
      
      <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-medium">
        <Link href="/dashboard" className="hover:opacity-60 transition-opacity">App</Link>
        <Link href="/blockchain" className="hover:opacity-60 transition-opacity">Network</Link>
        <button 
          onClick={toggleTheme}
          className="ml-4 border-none p-0 hover:bg-transparent hover:text-inherit flex items-center gap-2"
        >
          {theme === 'light' ? (
            <span className="flex items-center gap-1.5 border border-[var(--border)] px-3 py-1.5 rounded-full hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
              DARK MODE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 border border-[var(--border)] px-3 py-1.5 rounded-full hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
              LIGHT MODE
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
