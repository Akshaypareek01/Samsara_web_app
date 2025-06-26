"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MailIcon, UserIcon } from "lucide-react";
import Lottie from "lottie-react";
import successAnimation from "./sucess.json";
import { useRouter } from "next/navigation";

export default function Home() {
  const [role, setRole] = useState("Student");
  const [step, setStep] = useState("signin");
  const [verificationCode, setVerificationCode] = useState(Array(4).fill(""));
  const [, setCircleSize] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // ✅ Add router hook here

  useEffect(() => {
    if (containerRef.current && step === "success") {
      const containerWidth = containerRef.current.offsetWidth;
      setCircleSize(containerWidth * 2);
    }
  }, [step]);

  const handleSignIn = () => setStep("verification");

  const handleVerify = () => {
    setStep("success");
    setTimeout(() => {
      console.log("Redirecting to dashboard...");
      router.push("/Homepage");
    }, 3000);
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
                />
              </div>

              <button onClick={handleSignIn} className="signin-button">
                Sign In
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

              <button
                onClick={handleVerify}
                className="verify-button"
                style={{ position: "relative", bottom: "25px" }}
              >
                Continue
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
