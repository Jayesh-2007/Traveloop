function ErrorMessage({ message = 'Something went wrong.' }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100/70">
      {message}
    </div>
  );
}

export default ErrorMessage;
