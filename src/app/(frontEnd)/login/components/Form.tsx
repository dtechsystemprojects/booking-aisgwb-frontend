"use client";
import OTPInput from "@/components/OTPInput";
import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { frontendLoginSendOtp, frontendVerifyLoginOtp } from "@/redux/slices/frontEnd/userSlice";
import {
  Alert,
  Badge,
  Button,
  Form,
  FormCheck,
  FormControl,
  FormLabel,
  InputGroup,
} from "react-bootstrap";
import toast from "react-hot-toast";

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const detectIdentifierType = (value: string) => {
    if (!value) return null;
    if (value.includes("@")) return "email";
    if (/^[+0-9\s-]{7,15}$/.test(value)) return "mobile";
    return "text";
  };

  const idType = detectIdentifierType(identifier);

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      setLocalError("Please enter your email or mobile number first.");
      toast.error("Please enter your email or mobile number first.");
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await dispatch(frontendLoginSendOtp({ email: identifier })).unwrap();

      setOtpSent(true);
      setCountdown(60);
      toast.success(`Verification code sent to ${identifier}`);
    } catch (err: any) {
      setLocalError(err.message || "Failed to send OTP.");
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      const fullOtp = otpCode.join("");
      if (fullOtp.length < 6) {
        setLocalError("Please enter the full 6-digit OTP code.");
        toast.error("Please enter the full 6-digit OTP code.");
        return;
      }

      setLoading(true);
      await dispatch(frontendVerifyLoginOtp({ email: identifier, otp: fullOtp })).unwrap();

      sessionStorage.setItem("show_frontend_login_toast", "true");

      const urlParams = new URLSearchParams(window.location.search);
      const nextUrl = urlParams.get("next");

      // Force full page reload to properly re-initialize Redux state for frontend
      if (nextUrl && nextUrl.startsWith("/")) {
        window.location.href = nextUrl;
      } else {
        window.location.href = "/profile";
      }

    } catch (err: any) {
      let msg = typeof err === 'string' ? err : err?.message || err?.error || "Authentication failed";
      if (msg === "Rejected") msg = "Authentication failed. Please check your credentials and try again.";
      setLocalError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {localError && (
        <Alert
          variant="danger"
          className="d-flex align-items-center gap-2 py-2 fs-13"
        >
          <Icon icon="alert-circle" className="fs-18 flex-shrink-0" />
          <div>
            {(() => {
              const errStr = typeof localError === 'string'
                ? localError
                : JSON.stringify(localError);
              return errStr === 'Rejected' ? 'Authentication failed. Please check your credentials and try again.' : errStr;
            })()}
          </div>
        </Alert>
      )}

      {/* Username / Email / Mobile Identifier Input */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <FormLabel className="mb-0 fs-14">
            Email Or Mobile <span className="text-danger">*</span>
          </FormLabel>
          {idType && (
            <Badge
              bg={
                idType === "email"
                  ? "info-subtle"
                  : idType === "mobile"
                    ? "success-subtle"
                    : "secondary-subtle"
              }
              className="text-dark fs-11 px-2 py-1"
            >
              <Icon
                icon={
                  idType === "email"
                    ? "mail"
                    : idType === "mobile"
                      ? "phone"
                      : "user"
                }
                className="me-1"
              />
              {idType === "email"
                ? "Email Address"
                : idType === "mobile"
                  ? "Mobile Number"
                  : "Email / Mobile"}
            </Badge>
          )}
        </div>
        <InputGroup>
          <InputGroup.Text className="bg-light text-muted">
            <Icon
              icon={
                idType === "mobile"
                  ? "phone"
                  : idType === "email"
                    ? "mail"
                    : "user"
              }
            />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="Email Or Mobile"
            required
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIdentifier(e.target.value)
            }
          />
        </InputGroup>
      </div>

      <>
        {!otpSent ? (
          <div className="mb-3">
            <Alert
              variant="info"
              className="d-flex align-items-center gap-2 py-2 fs-13 mb-3"
            >
              <Icon icon="info" className="fs-18 flex-shrink-0" />
              <span>
                We will send a secure 6-digit one-time password (OTP) to
                verify your account.
              </span>
            </Alert>
            <Button
              variant="outline-primary"
              type="button"
              className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={handleSendOtp}
            >
              <Icon icon="send" />
              Send OTP Verification Code
            </Button>
          </div>
        ) : (
          <div className="mb-3 p-3 bg-light rounded border otp-box">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fs-13 fw-semibold text-success d-flex align-items-center gap-1">
                <Icon icon="check-circle" /> OTP Sent to {identifier}
              </span>
            </div>

            <OTPInput
              code={otpCode}
              setCode={setOtpCode}
              label="Enter 6-Digit Verification Code"
            />

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span className="text-muted fs-12">
                {countdown > 0 ? (
                  <>Resend in {countdown}s</>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-underline fs-12"
                    onClick={handleSendOtp}
                    type="button"
                  >
                    Resend OTP
                  </Button>
                )}
              </span>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-muted fs-12"
                onClick={() => setOtpSent(false)}
                type="button"
              >
                Edit Email/Mobile
              </Button>
            </div>
          </div>
        )}
      </>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <FormCheck>
          <Form.Check.Input
            className="form-check-input-light fs-14"
            type="checkbox"
            id="rememberMe"
            defaultChecked
          />
          <Form.Check.Label htmlFor="rememberMe" className="fs-13">
            Remember Me
          </Form.Check.Label>
        </FormCheck>
      </div>

      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          className="fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
          disabled={loading || !otpSent}
        >
          <Icon icon="log-in" />
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
