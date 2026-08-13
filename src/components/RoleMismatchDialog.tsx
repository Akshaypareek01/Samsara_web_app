"use client";

import Modal from "./Modal";

export type LoginType = "student" | "coach";

type RoleMismatchDialogProps = {
  open: boolean;
  message: string;
  switchTo: LoginType;
  onClose: () => void;
  onSwitch: (loginType: LoginType) => void;
};

/**
 * Popup when the Student / Wellness Coach tab does not match the account.
 */
export default function RoleMismatchDialog({
  open,
  message,
  switchTo,
  onClose,
  onSwitch,
}: RoleMismatchDialogProps) {
  const switchLabel =
    switchTo === "coach" ? "Sign in as Wellness Coach" : "Sign in as Student";

  return (
    <Modal
      open={open}
      title="Wrong account type"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            aria-label="Dismiss"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => onSwitch(switchTo)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#EB855F] hover:bg-[#e0754d] transition"
            aria-label={switchLabel}
          >
            {switchLabel}
          </button>
        </div>
      }
    >
      <p className="text-gray-700 text-[15px] leading-relaxed">{message}</p>
    </Modal>
  );
}

/**
 * Fallback copy when the selected login tab does not match the account.
 * @param loginType Selected Student / Wellness Coach tab
 */
export function roleMismatchMessage(loginType: LoginType): string {
  if (loginType === "coach") {
    return "This email belongs to a student account. Please sign in as Student.";
  }
  return "This email belongs to a wellness coach account. Please sign in as Wellness Coach.";
}

/**
 * Maps the web login tab to backend User.role.
 * @param loginType Selected Student / Wellness Coach tab
 */
export function loginTypeToRole(loginType: LoginType): "user" | "teacher" {
  return loginType === "coach" ? "teacher" : "user";
}
