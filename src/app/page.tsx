"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MailIcon, UserIcon } from "lucide-react";
import Lottie from "lottie-react";
import successAnimation from "./sucess.json";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";

export default function Home() {
  const [role, setRole] = useState("Student");
  const [step, setStep] = useState("signin");
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
    if (!email) {
      setError("Please enter your email.");
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
        toast.error(data.message || "Failed to send OTP");
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
    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      toast.error("Please enter the 4-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Invalid OTP.");
        toast.error(data.message || "OTP is invalid");
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log("OTP verify response:", data);
      // Store access token in cookies
      if (data.tokens && data.tokens.access && data.tokens.access.token) {
        Cookies.set("accessToken", data.tokens.access.token, {
          expires: data.tokens.access.expires
            ? new Date(data.tokens.access.expires)
            : 7, // fallback 7 days
        });
      }
      // Store user details in cookies
      if (data.user) {
        Cookies.set("user", JSON.stringify(data.user), {
          expires:
            data.tokens && data.tokens.access && data.tokens.access.expires
              ? new Date(data.tokens.access.expires)
              : 7,
        });
      }
      setStep("success");
      toast.success("OTP verified successfully");
      setTimeout(() => {
        router.push("/Homepage");
      }, 3000);
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
              <span className="heading-top">Welcome to Your Wellness</span>
              <br />
              <span className="heading-bottom">Journey</span>
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
            <div className="logo-container">
              <div className="logo-wrapper">
                <Image
                  src="/images/logo.svg"
                  alt="Samsara Logo"
                  fill
                  className="logo-image"
                />
              </div>
              <span className="logo-text">SAMSARA</span>
            </div>
          )}

          {step === "signin" && (
            <>
              <h2 className="auth-title">Sign In to Samsara</h2>
              <p className="auth-subtitle">Continue your wellness journey</p>

              <div className="role-switch">
                {["Student", "Wellness Coach"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setRole(item)}
                    className={`role-button ${
                      role === item ? "role-active" : ""
                    }`}
                  >
                    <div
                      className={`role-icon ${
                        role === item ? "active-icon" : ""
                      }`}
                    >
                      <UserIcon
                        className={
                          role === item ? "icon-active" : "icon-inactive"
                        }
                      />
                    </div>
                    <span
                      className={`role-text ${
                        role === item ? "text-active" : ""
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                ))}
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
                  disabled={loading}
                />
              </div>
              {error && (
                <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
              )}
              <button
                onClick={handleSignIn}
                className="signin-button"
                disabled={loading}
              >
                {loading ? "Sending..." : "Sign In"}
              </button>
            </>
          )}

          {step === "verification" && (
            <div className="verification-container animate-fadeIn">
              <h2 className="auth-title">Verification Code</h2>
              <p className="auth-subtitle">
                We have sent the verification code to your email address
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
                <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
              )}
              <button
                onClick={handleVerify}
                className="verify-button"
                style={{ position: "relative", bottom: "25px" }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="success-container animate-fadeIn">
              <div className="animation-wrapper">
                <Lottie animationData={successAnimation} loop={false} />
              </div>
              <div className="success-text-container">
                <h2 className="success-title">Success!</h2>
                <p className="success-message">
                  Congratulations! You have been <br />
                  successfully authenticated
                </p>
              </div>
            </div>
          )}
        </div>

        {step !== "success" && (
          <div className="auth-footer">
            <p>Copyright © 2025 Samsara Wellness. All rights reserved.</p>
            <p>Powered by Samsara Innovations</p>
          </div>
        )}
      </div>
    </div>
  );
}
