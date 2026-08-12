"use client";

import Image from "next/image";
import { useState } from "react";

type LetterAvatarProps = {
  /** Display name used for the letter fallback. */
  name?: string | null;
  /** Optional photo URL; falls back to letter when missing/broken. */
  src?: string | null;
  /** Pixel size (width & height). Default 40. */
  size?: number;
  /** Extra Tailwind classes on the root. */
  className?: string;
  /** Accessible label; defaults to name. */
  alt?: string;
};

/**
 * Returns the first letter of a name for avatar fallbacks.
 * @param name - Person or entity name
 */
function getInitial(name?: string | null): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

/**
 * Returns true when `src` is a usable photo URL (not placeholder logos).
 * @param src - Candidate image URL
 */
function isUsablePhoto(src?: string | null): boolean {
  if (!src || !src.trim()) return false;
  const lower = src.toLowerCase();
  if (lower.includes("/images/logo.svg")) return false;
  if (lower.includes("/images/user1.svg")) return false;
  return true;
}

/**
 * Circular avatar that shows a photo when available, otherwise a letter
 * on a cream/orange-tint background (company portal pattern).
 */
export default function LetterAvatar({
  name,
  src,
  size = 40,
  className = "",
  alt,
}: LetterAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = getInitial(name);
  const label = alt ?? name ?? "Avatar";
  const showPhoto = isUsablePhoto(src) && !imgFailed;

  if (showPhoto) {
    return (
      <Image
        src={src as string}
        alt={label}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[#fff4ef] text-[#c95520] font-bold shrink-0 border border-[#ffe0d0] ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-label={label}
      role="img"
    >
      {initial}
    </span>
  );
}
