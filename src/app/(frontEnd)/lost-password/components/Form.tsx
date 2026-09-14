"use client";
import OTPInput from "@/components/OTPInput";
import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Form,
  FormControl,
  FormLabel,
  InputGroup,
} from "react-bootstrap";

const ResetForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detectIdentifierType = (value: string) => {
    if (!value) return null;
    if (value.includes("@")) return "email";
    if (/^[+0-9\s-]{7,15}$/.test(value)) return "mobile";
    return "text";
  };

  const idType = detectIdentifierType(identifier);

  const handleSendOtp = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError("Please enter a valid email id.");
      return;
    }
    setStep(2);
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = otpCode.join("");
    if (code !== "123456") {
      setError("Invalid OTP code. Use demo code 123456.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setStep(3);
  };

  if (step === 3) {
    return (
      <div className="text-center py-3">
        <div className="mb-3">
          <Icon
            icon="check-circle"
            className="text-success"
            style={{ fontSize: "48px" }}
          />
        </div>
        <h5 className="fw-bold mb-2">Password Successfully Reset!</h5>
        <p className="text-muted fs-13 mb-4">
          Your password has been updated securely. You can now log in using your
          new credentials.
        </p>
        <div className="d-grid">
          <Link
            href="/login"
            className="btn btn-primary fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
          >
            <Icon icon="log-in" />
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <Alert
          variant="danger"
          className="d-flex align-items-center gap-2 py-2 fs-13"
        >
          <Icon icon="alert-circle" className="fs-18 flex-shrink-0" />
          <div>{error}</div>
        </Alert>
      )}

      {step === 1 ? (
        <Form onSubmit={handleSendOtp}>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <FormLabel className="mb-0">
                Email ID <span className="text-danger">*</span>
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
                    ? "Email"
                    : idType === "mobile"
                      ? "Mobile"
                      : "Identifier"}
                </Badge>
              )}
            </div>
            <InputGroup>
              <InputGroup.Text className="bg-light text-muted">
                <Icon icon={idType === "mobile" ? "phone" : "mail"} />
              </InputGroup.Text>
              <FormControl
                type="text"
                placeholder="Enter your email id"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </InputGroup>
          </div>

          <div className="d-grid">
            <Button
              variant="primary"
              type="submit"
              className="fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
            >
              <Icon icon="send" />
              Send Verification OTP Code
            </Button>
          </div>
        </Form>
      ) : (
        <Form onSubmit={handleResetPassword}>
          <div className="p-3 bg-light rounded border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fs-13 fw-semibold text-success d-flex align-items-center gap-1">
                <Icon icon="check-circle" /> Verification OTP Sent
              </span>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-underline fs-12"
                onClick={() => setOtpCode(["1", "2", "3", "4", "5", "6"])}
                type="button"
              >
                Quick Fill Demo OTP (123456)
              </Button>
            </div>

            <OTPInput
              code={otpCode}
              setCode={setOtpCode}
              label="Enter 6-Digit Code"
            />
          </div>

          <div className="mb-3">
            <FormLabel>
              New Password <span className="text-danger">*</span>
            </FormLabel>
            <InputGroup>
              <InputGroup.Text className="bg-light text-muted">
                <Icon icon="lock" />
              </InputGroup.Text>
              <FormControl
                type="password"
                placeholder="New strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </InputGroup>
          </div>

          <div className="mb-3">
            <FormLabel>
              Confirm New Password <span className="text-danger">*</span>
            </FormLabel>
            <InputGroup>
              <InputGroup.Text className="bg-light text-muted">
                <Icon icon="lock" />
              </InputGroup.Text>
              <FormControl
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </InputGroup>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              className="fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              <Icon icon="shield-check" />
              {loading ? "Resetting Password..." : "Reset & Save Password"}
            </Button>
            <Button
              variant="light"
              type="button"
              onClick={() => setStep(1)}
              className="fw-semibold"
            >
              Back
            </Button>
          </div>
        </Form>
      )}
    </>
  );
};

export default ResetForm;
