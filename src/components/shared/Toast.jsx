function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="bg-green-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl flex items-center gap-2.5">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
        {message}
      </div>
    </div>
  );
}

export default Toast;