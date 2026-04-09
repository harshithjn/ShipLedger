const contributors = [
  { name: 'Harshith J', role: 'Lead Developer', link: 'https://github.com/harshithjn' },
  { name: 'Nidhi Udupa', role: 'Blockchain Engineer', link: 'https://github.com/nidhin-eng' },
  { name: 'Mohammed Bilal', role: 'Full Stack Dev', link: 'https://github.com/bilalinbytes' },
];

export default function Contributors() {
  return (
    <section className="py-12 px-6 max-w-4xl mx-auto">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-8 text-center">Protocol Contributors</h2>
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
        {contributors.map((c) => (
          <a 
            key={c.name} 
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="text-sm font-semibold tracking-tight group-hover:text-white transition-colors">
              {c.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {c.role}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
