type EmptyStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/**
 * Dashed, brand-tinted empty state used across Homepage screens.
 */
export default function EmptyState({
  message,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`rounded-xl border border-dashed border-[#ffe0d0] bg-[#fff4ef]/70 p-8 text-center text-sm text-gray-500 ${className}`}
    >
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#ed662e] px-4 py-2 text-sm font-medium text-white hover:bg-[#c95520] transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
