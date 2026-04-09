import TransactionItem from './TransactionItem';

export default function BlockCard({ number, timestamp, transactions }) {
  return (
    <div className="min-w-[300px] border border-[var(--border)] p-6 bg-[var(--background)] relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold tracking-tighter">BLOCK #{number}</h3>
        <span className="text-[10px] text-gray-500 font-mono">{timestamp}</span>
      </div>
      <hr className="my-4 border-zinc-800" />
      <div className="space-y-1">
        <p className="text-[10px] uppercase text-zinc-500 mb-2">Transactions</p>
        {transactions.map((tx, i) => (
          <TransactionItem key={i} event={tx.event} hash={tx.hash} />
        ))}
      </div>
      <div className="mt-8 pt-4 border-t border-zinc-900">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></div>
          <span className="text-[8px] uppercase tracking-widest text-zinc-600">Verified by Consensus</span>
        </div>
      </div>
    </div>
  );
}
