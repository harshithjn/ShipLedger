const features = [
  { title: 'On-chain creation', description: 'Initialize shipments directly on the Ethereum blockchain for ultimate security.' },
  { title: 'Authenticity verification', description: 'Verify shipment integrity using cryptographic hashes and IPFS storage.' },
  { title: 'Real-time tracking', description: 'Monitor every stage of the shipment lifecycle from creation to delivery.' },
  { title: 'IPFS storage', description: 'Technical specifications and sensitive data stored decentrally for immutability.' },
  { title: 'Event notifications', description: 'Respond to status changes instantly with blockchain event emitters.' },
];

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div 
            key={f.title} 
            className="group relative bg-black p-10 border border-white/10 hover:border-white/40 transition-all duration-500 overflow-hidden"
          >
            <h3 className="text-lg font-bold uppercase mb-4 tracking-tighter group-hover:text-white transition-colors">
              {f.title}
            </h3>
            <p className="text-gray-300 leading-relaxed font-light text-sm transition-colors">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
