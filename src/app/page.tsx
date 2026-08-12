"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MailIcon } from "lucide-react";
import Lottie from "lottie-react";
import successAnimation from "./sucess.json";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";

export default function Home() {
  const [step, setStep] = useState("signin");
  const [loginType, setLoginType] = useState<"student" | "coach">("student");
  const [verificationCode, setVerificationCode] = useState(Array(4).fill(""));
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setCircleSize] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // ✅ Add router hook here

  useEffect(() => {
    if (containerRef.current && step === "success") {
      const containerWidth = containerRef.current.offsetWidth;
      setCircleSize(containerWidth * 2);
    }
  }, [step]);

  const handleSignIn = async () => {
    setError("");
    const trimmed = email.trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!trimmed) {
      setError("Please enter your email.");
      toast.error("Please enter your email.");
      return;
    }
    if (!emailOk) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmail(trimmed);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          res.status === 429
            ? data.message || "Too many OTP requests. Please wait and try again."
            : data.message || "Failed to send OTP.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      setStep("verification");
      toast.success("OTP sent successfully");
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    const otp = verificationCode.join("");
    if (!/^\d{4}$/.test(otp)) {
      setError("Please enter the 4-digit OTP.");
      toast.error("Please enter the 4-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          res.status === 429
            ? data.message || "Too many attempts. Please wait and try again."
            : data.message || "Invalid OTP.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const userRole = data?.user?.role as string | undefined;
      const cookieExpires =
        data.tokens?.access?.expires
          ? new Date(data.tokens.access.expires)
          : 7;

      // Tab is a UX hint only — never reject after OTP (OTP is already consumed).
      if (loginType === "student" && userRole === "teacher") {
        toast("This account is a Wellness Coach — signing you in as coach");
      } else if (loginType === "coach" && userRole === "user") {
        toast("This account is a Student — signing you in as student");
      }

      if (data.tokens?.access?.token) {
        Cookies.set("accessToken", data.tokens.access.token, {
          expires: cookieExpires,
          path: "/",
          sameSite: "lax",
        });
      }

      // Slim cookie — full profile payloads can exceed browser cookie size limits.
      if (data.user) {
        const slimUser = {
          id: data.user.id || data.user._id,
          _id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          profileImage: data.user.profileImage,
        };
        Cookies.set("user", JSON.stringify(slimUser), {
          expires: cookieExpires,
          path: "/",
          sameSite: "lax",
        });
      }

      setStep("success");
      toast.success("OTP verified successfully");

      const dest =
        userRole === "teacher"
          ? "/Homepage/Classes/Scheduled"
          : "/Homepage/Classes";

      setTimeout(() => {
        router.push(dest);
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleVerify();
      return;
    }
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-right" />
      {/* Left Side - Welcome - Fixed Position */}
      <div className="left-side">
        <Image
          src="/images/yogroom.png"
          alt="Wellness Room"
          fill
          className="bg-image"
          priority
        />
        <div className="overlay" />
        <div className="content-section">
          <div className="content-wrapper">
            <h1 className="welcome-heading">
              <span className="heading-top">Welcome to Your </span>

              <span className="heading-bottom">Wellness Journey</span>
            </h1>

            <p className="welcome-description">
              Begin your transformation with{" "}
              <span className="samsara-highlight">Samsara Wellness</span>. Join
              our community of mindful individuals seeking balance and inner
              peace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Scrollable Content */}
      <div
        ref={containerRef}
        className={`right-side ${step === "success" ? "success-bg" : ""}`}
      >
        <div className="auth-content">
          {step !== "success" && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                src="/images/SamsaraLogo.png"
                alt="Samsara Logo"
                width={200}
                height={200}
              />
            </div>
          )}

          {step === "signin" && (
            <>
              {/* <h2 className="auth-title">Sign In to Samsara</h2> */}
              <p className="auth-subtitle" style={{ marginTop: "20px" }}>
                Continue your wellness journey
              </p>

              {/* CODW BLOCK */}
              <div className="role-tabs">
                <button
                  type="button"
                  onClick={() => setLoginType("student")}
                  className={`role-tab ${loginType === "student" ? "role-tab-active" : ""
                    }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setLoginType("coach")}
                  className={`role-tab ${loginType === "coach" ? "role-tab-active" : ""
                    }`}
                >
                  Wellness Coach
                </button>
              </div>

              <div className="email-input">
                <span className="email-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  placeholder="Enter Email ID"
                  className="email-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSignIn();
                    }
                  }}
                  disabled={loading}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-label="Email address"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center mb-4 px-4">
                  {error}
                </div>
              )}
              <button
                onClick={handleSignIn}
                className="signin-button"
                disabled={loading}
                type="button"
              >
                {loading ? "Sending..." : "Sign In"}
              </button>
            </>
          )}

          {step === "verification" && (
            <div className="verification-container animate-fadeIn">
              <h2 className="auth-title">Verification Code</h2>
              <p className="auth-subtitle">
                We&apos;ve sent a verification code to {email}
              </p>

              <div className="code-container">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="code-input"
                    inputMode="numeric"
                  />
                ))}
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center mb-4 px-4">
                  {error}
                </div>
              )}
              <button
                onClick={handleVerify}
                className="verify-button"
                disabled={loading || verificationCode.some(digit => !digit)}
                type="button"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => setStep("signin")}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                  type="button"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="success-container animate-fadeIn">
              <div className="animation-wrapper">
                <Lottie animationData={successAnimation} loop={false} />
              </div>
              <div className="success-text-container">
                <h2 className="success-title">Success!</h2>
                <p className="success-subtitle">
                  Congratulations! You have been successfully authenticated
                </p>
              </div>
            </div>
          )}
        </div>

        {step !== "success" && (
          <div className="auth-footer">
            <p>Copyright © 2026 Samsara Wellness. All rights reserved.</p>
            <p>Powered by Samsaraa WellTek Pvt Ltd</p>
          </div>
        )}
      </div>
    </div>
  );
}
