type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
};

/**
 * Section title + optional View All / Show less control (company portal style).
 */
export default function SectionHeader({
  title,
  actionLabel,
  onAction,
  showAction = true,
}: SectionHeaderProps) {
  const label = actionLabel ?? "View All →";

  return (
    <div className="flex justify-between items-center gap-3">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {showAction && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-[#ed662e] hover:text-[#c95520] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 rounded"
        >
          {label}
        </button>
      ) : null}
    </div>
  );
}
