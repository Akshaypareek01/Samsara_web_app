import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** API base — set NEXT_PUBLIC_API_BASE_URL to override (e.g. http://localhost:8000/v1). */
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/v1'
    : 'https://apis-samsarawellness.in/v1');
