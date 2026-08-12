type PortalCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Render as article instead of div. */
  as?: "div" | "article" | "section";
};

/**
 * Thin white card wrapper matching company portal density
 * (rounded-xl, soft shadow, light border).
 */
export default function PortalCard({
  children,
  className = "",
  as: Tag = "div",
}: PortalCardProps) {
  return (
    <Tag
      className={`bg-white rounded-xl border border-orange-100/80 shadow-sm ${className}`}
    >
      {children}
    </Tag>
  );
}
