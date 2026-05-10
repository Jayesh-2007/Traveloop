function Card({ children, className = '' }) {
  return (
    <section
      className={[
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/80',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  );
}

export default Card;
