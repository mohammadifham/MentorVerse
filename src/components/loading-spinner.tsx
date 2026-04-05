export function LoadingSpinner() {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      <span>Processing with MentorVerse agents...</span>
    </div>
  );
}
