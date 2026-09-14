"use client";
import OTPInput from "@/components/OTPInput";
import Icon from "@/components/wrappers/Icon";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { frontendSendOtp, frontendVerifyRegistrationOtp } from "@/redux/slices/frontEnd/userSlice";
import {
  Alert,
  Button,
  Form,
  FormCheck,
  FormControl,
  FormLabel,
} from "react-bootstrap";

const Forms = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  

  const handleProceedToOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!email.trim()) newErrors.email = "Email Address is required";
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile Number is required";
    if (!sex) newErrors.sex = "Sex is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Policy to register.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: fullName.trim(),
        groupId: "GRP-3",
        sex,
        email: email.trim(),
        mobile: mobileNo.trim(),
        username: email.trim(),
        password: "TempPassword123!",
      };

      await dispatch(frontendSendOtp(payload)).unwrap();

      setStep(2);
      import("react-hot-toast").then((toast) => toast.default.success(`Verification code sent to ${email}`));
    } catch (err: any) {
      const msg = err.message || err || "Failed to send OTP. Please try again.";
      if (typeof msg === "string") {
        if (msg.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: msg }));
        } else if (msg.toLowerCase().includes("mobile")) {
          setErrors((prev) => ({ ...prev, mobileNo: msg }));
        } else {
          setError(msg);
        }
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = otpCode.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      
      await dispatch(frontendVerifyRegistrationOtp({ email: email.trim(), otp: code })).unwrap();
      
      sessionStorage.setItem("show_frontend_login_toast", "true");
      
      window.location.href = "/profile";
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
        <Form onSubmit={handleProceedToOtp} noValidate>
          <div className="row">
            <div className="col-md-12 mb-3">
              <FormLabel className="fw-semibold">
                Full Name <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="text"
                placeholder="Enter full name..."
                value={fullName}
                onChange={(e) => {
                  const val = e.target.value;
                  setFullName(val);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                isInvalid={!!errors.fullName}
              />
              <Form.Control.Feedback type="invalid" className="fs-13">
                {errors.fullName}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <FormLabel className="fw-semibold">
                Email Address <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid" className="fs-13">
                {errors.email}
              </Form.Control.Feedback>
            </div>
            <div className="col-md-12 mb-3">
              <FormLabel className="fw-semibold">
                Mobile Number <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="text"
                placeholder="Enter mobile number"
                value={mobileNo}
                onChange={(e) => {
                  setMobileNo(e.target.value);
                  if (errors.mobileNo) setErrors((prev) => ({ ...prev, mobileNo: "" }));
                }}
                isInvalid={!!errors.mobileNo}
              />
              <Form.Control.Feedback type="invalid" className="fs-13">
                {errors.mobileNo}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <FormLabel className="fw-semibold">
                Sex <span className="text-danger">*</span>
              </FormLabel>
              <div className="d-flex gap-4 mt-2">
                <FormCheck type="radio" id="sexMale" className="d-flex align-items-center gap-2">
                  <FormCheck.Input 
                    type="radio" 
                    name="sex" 
                    value="Male"
                    checked={sex === "Male"}
                    onChange={(e) => {
                      setSex(e.target.value);
                      if (errors.sex) setErrors((prev) => ({ ...prev, sex: "" }));
                    }}
                    isInvalid={!!errors.sex}
                    className="mt-0"
                  />
                  <FormCheck.Label className="mb-0">Male</FormCheck.Label>
                </FormCheck>
                <FormCheck type="radio" id="sexFemale" className="d-flex align-items-center gap-2">
                  <FormCheck.Input 
                    type="radio" 
                    name="sex" 
                    value="Female"
                    checked={sex === "Female"}
                    onChange={(e) => {
                      setSex(e.target.value);
                      if (errors.sex) setErrors((prev) => ({ ...prev, sex: "" }));
                    }}
                    isInvalid={!!errors.sex}
                    className="mt-0"
                  />
                  <FormCheck.Label className="mb-0">Female</FormCheck.Label>
                </FormCheck>
              </div>
              {errors.sex && <div className="text-danger fs-13 mt-1">{errors.sex}</div>}
            </div>
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
              disabled={loading}
            >
              <Icon icon="shield-check" />
              {loading ? "Sending OTP..." : "Continue to OTP Verification"}
            </Button>
          </div>
        </Form>
      ) : (
        <Form onSubmit={handleCompleteRegistration}>
          <div className="p-3 bg-light rounded border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fs-13 fw-semibold text-success d-flex align-items-center gap-1">
                <Icon icon="check-circle" /> OTP Sent to {email}
              </span>
            </div>

            <OTPInput
              code={otpCode}
              setCode={setOtpCode}
              label="Enter Registration Verification Code"
            />

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span className="text-muted fs-12">Code expires in 2:00</span>
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
