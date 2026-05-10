function Card({ children, className = '' }) {
  return (
    <section
      className={[
        'rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  );
}

export default Card;
