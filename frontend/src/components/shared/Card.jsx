function Card({ children, className = '', title }) {
  return (
    <section
      className={[
        'rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6',
        className,
      ].join(' ')}
    >
      {title && <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>}
      {children}
    </section>
  );
}

export default Card;
