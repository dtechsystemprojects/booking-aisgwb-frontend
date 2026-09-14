"use client";
import OTPInput from "@/components/OTPInput";
import PasswordInputWithStrength from "@/components/PasswordInputWithStrength";
import Icon from "@/components/wrappers/Icon";
import { META_DATA } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Form,
  FormCheck,
  FormControl,
  FormLabel,
  FormSelect,
  InputGroup,
} from "react-bootstrap";

const Forms = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detectIdentifierType = (value: string) => {
    if (!value) return null;
    if (value.includes("@")) return "email";
    if (/^[+0-9\s-]{7,15}$/.test(value)) return "mobile";
    return "text";
  };

  const idType = detectIdentifierType(identifier);

  const handleProceedToOtp = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !identifier.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Policy to register.");
      return;
    }

    setStep(2);
  };

  const handleCompleteRegistration = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = otpCode.join("");
    if (code !== "123456") {
      setError("Invalid verification OTP code. Try 123456 for demo.");
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        identifier: identifier.trim(),
        password,
      });
      router.replace("/auth/sign-in");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
        <Form onSubmit={handleProceedToOtp}>
          <div className="mb-3">
            <FormLabel>
              Full Name <span className="text-danger">*</span>
            </FormLabel>
            <InputGroup>
              <InputGroup.Text className="bg-light text-muted">
                <Icon icon="user" />
              </InputGroup.Text>
              <FormControl
                type="text"
                placeholder={META_DATA.username || "Enter your full name"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </InputGroup>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <FormLabel className="mb-0">
                Email or Mobile Number <span className="text-danger">*</span>
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
                placeholder="you@example.com or +1 555-0199"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </InputGroup>
          </div>

          <div className="mb-3" data-password="bar">
            <PasswordInputWithStrength
              id="password"
              label="Password"
              name="password"
              password={password}
              setPassword={setPassword}
              showIcon
              placeholder="Create strong password..."
            />
          </div>

          <div className="mb-3">
            <FormCheck>
              <Form.Check.Input
                className="form-check-input-light fs-14"
                type="checkbox"
                id="termAndPolicy"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <Form.Check.Label htmlFor="termAndPolicy" className="fs-13">
                I agree to the Terms of Service &amp; Privacy Policy
              </Form.Check.Label>
            </FormCheck>
          </div>

          <div className="d-grid">
            <Button
              variant="primary"
              type="submit"
              className="fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
            >
              <Icon icon="shield-check" />
              Continue to OTP Verification
            </Button>
          </div>
        </Form>
      ) : (
        <Form onSubmit={handleCompleteRegistration}>
          <div className="p-3 bg-light rounded border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fs-13 fw-semibold text-success d-flex align-items-center gap-1">
                <Icon icon="check-circle" /> OTP Sent to {identifier}
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
              label="Enter Registration Verification Code"
            />

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span className="text-muted fs-12">Code expires in 5:00</span>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-muted fs-12"
                onClick={() => setStep(1)}
                type="button"
              >
                Edit Details
              </Button>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              className="fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              <Icon icon="user-plus" />
              {loading
                ? "Creating Account..."
                : "Complete Account Verification"}
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

export default Forms;
