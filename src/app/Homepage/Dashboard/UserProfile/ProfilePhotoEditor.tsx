"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import LetterAvatar from "@/components/LetterAvatar";
import {
  removeProfileImage,
  uploadAndSetProfileImage,
} from "@/lib/uploadProfileImage";

type ProfilePhotoEditorProps = {
  name: string;
  src?: string;
  size?: number;
  showRemove?: boolean;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
};

/**
 * Reads the access token from cookies.
 */
function getAccessToken(): string | null {
  const token = getCookie("accessToken");
  return typeof token === "string" && token ? token : null;
}

/**
 * Avatar with a camera control that uploads a new profile photo immediately.
 */
export default function ProfilePhotoEditor({
  name,
  src,
  size = 96,
  showRemove = false,
  onUploaded,
  onRemoved,
}: ProfilePhotoEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  /**
   * Uploads the selected file and persists it as the profile photo.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error("Please login to update your photo.");
      return;
    }

    setBusy(true);
    const toastId = toast.loading("Uploading photo...");
    try {
      const url = await uploadAndSetProfileImage(file, accessToken);
      onUploaded(url);
      toast.success("Profile photo updated", { id: toastId });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update photo";
      toast.error(message, { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  /**
   * Clears the saved profile photo.
   */
  const handleRemove = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error("Please login to update your photo.");
      return;
    }

    setBusy(true);
    const toastId = toast.loading("Removing photo...");
    try {
      await removeProfileImage(accessToken);
      onRemoved?.();
      toast.success("Profile photo removed", { id: toastId });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove photo";
      toast.error(message, { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative inline-block">
        <div className="inline-flex rounded-full overflow-hidden border-4 border-[#ffe0d0]">
          <LetterAvatar name={name} src={src} size={size} />
        </div>
        <button
          type="button"
          aria-label="Change profile photo"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-[#ed662e] hover:bg-[#c95520] text-white p-2 rounded-full shadow-lg min-h-[36px] min-w-[36px] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <Camera size={14} aria-hidden />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          aria-label="Upload profile photo"
          onChange={handleFileChange}
        />
      </div>
      {showRemove && src ? (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          className="mt-3 flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm disabled:opacity-60"
          aria-label="Remove profile photo"
        >
          <Trash2 size={14} aria-hidden />
          Remove
        </button>
      ) : null}
    </div>
  );
}
