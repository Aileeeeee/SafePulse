export default function SilentConfirmation({
  submitted,
}) {
  if (!submitted) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-[#1a3d2a] text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-pulse">
      ✓ Reported Silently
    </div>
  );
}