import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";

/** Dispatched after a successful profile-photo update so the shell can refresh the avatar. */
export const PROFILE_UPDATED_EVENT = "samsara:profile-updated";

const MAX_PROFILE_IMAGE_BYTES = 15 * 1024 * 1024;

/**
 * Validates a picked profile photo before upload.
 * @param file Selected image file
 */
export function assertProfileImageFile(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error("Image must be under 15MB.");
  }
}

/**
 * Uploads a file to `/upload` then saves it as the current user's `profileImage`.
 * @param file Image file
 * @param accessToken Bearer token
 * @returns Public image URL
 */
export async function uploadAndSetProfileImage(
  file: File,
  accessToken: string
): Promise<string> {
  assertProfileImageFile(file);

  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const uploadData = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
    throw new Error(uploadData.message || "Failed to upload image");
  }

  const patchRes = await fetch(`${BASE_URL}/users/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profileImage: uploadData.url }),
  });
  const patchData = await patchRes.json().catch(() => ({}));
  if (!patchRes.ok) {
    throw new Error(patchData.message || "Failed to save profile photo");
  }

  const savedUrl = patchData.profileImage || uploadData.url;
  syncProfileImage(savedUrl);
  return savedUrl;
}

/**
 * Clears the current user's profile photo.
 * @param accessToken Bearer token
 */
export async function removeProfileImage(accessToken: string): Promise<void> {
  const patchRes = await fetch(`${BASE_URL}/users/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profileImage: "" }),
  });
  const patchData = await patchRes.json().catch(() => ({}));
  if (!patchRes.ok) {
    throw new Error(patchData.message || "Failed to remove profile photo");
  }
  syncProfileImage("");
}

/**
 * Updates the slim `user` cookie and notifies the homepage shell.
 * @param url New profile image URL, or empty string to clear
 */
export function syncProfileImage(url: string): void {
  try {
    const raw = Cookies.get("user");
    if (raw) {
      const user = JSON.parse(raw) as Record<string, unknown>;
      user.profileImage = url;
      Cookies.set("user", JSON.stringify(user), { path: "/", sameSite: "lax" });
    }
  } catch (err) {
    console.warn("Could not sync profile image cookie", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { profileImage: url } })
    );
  }
}
