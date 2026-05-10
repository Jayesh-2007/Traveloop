function Card({ children, className = '', interactive = true }) {
  return (
    <section
      className={[
        'rounded-2xl border border-white/80 bg-white/95 p-6 shadow-sm shadow-slate-200/70 backdrop-blur transition duration-200 ease-out',
        interactive ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/80' : '',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  );
}

export default Card;
