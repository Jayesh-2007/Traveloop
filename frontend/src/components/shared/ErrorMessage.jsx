function ErrorMessage({ message = 'Something went wrong.' }) {
  return (
    <div className="rounded-md border border-[var(--color-error)]/30 bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">
      {message}
    </div>
  );
}

export default ErrorMessage;
