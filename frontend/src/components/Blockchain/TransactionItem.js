export default function TransactionItem({ event, hash }) {
  return (
    <div className="py-2 border-b border-zinc-800 last:border-0 flex justify-between items-center group">
      <span className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
        {event}
      </span>
      <span className="text-[10px] font-mono text-zinc-600">
        {hash.substring(0, 10)}...
      </span>
    </div>
  );
}
