"use client";
import OTPInput from "@/components/OTPInput";
import Icon from "@/components/wrappers/Icon";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
  const { login, loading } = useAuth();

  const [identifier, setIdentifier] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);



  const detectIdentifierType = (value: string) => {
    if (!value) return null;
    if (value.includes("@")) return "email";
    if (/^[+0-9\s-]{7,15}$/.test(value)) return "mobile";
    return "text";
  };

  const idType = detectIdentifierType(identifier);



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login(identifier, password, false);
    } catch (err: any) {
      const msg = err.message || "Authentication failed";
      setLocalError(msg);
      toast.error(msg);
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
            {typeof localError === 'string' ? localError : JSON.stringify(localError)}
          </div>
        </Alert>
      )}

      {/* Username / Email / Mobile Identifier Input */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <FormLabel className="mb-0">
            Email ID<span className="text-danger">*</span>
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
                  : "Username / ID"}
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
            placeholder="admin@gmail.com"
            value={identifier}
            required
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIdentifier(e.target.value)
            }
          />
        </InputGroup>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <FormLabel className="mb-0">
            Password <span className="text-danger">*</span>
          </FormLabel>
          {/* <Link
            href="/auth/reset-pass"
            className="text-decoration-underline link-offset-3 text-muted fs-13"
          >
            Forgot Password?
          </Link> */}
        </div>
        <InputGroup>
          <InputGroup.Text className="bg-light text-muted">
            <Icon icon="lock" />
          </InputGroup.Text>
          <FormControl
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            required
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          <Button
            variant="light"
            type="button"
            className="border d-flex align-items-center justify-content-center text-muted px-3"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <Icon
              icon={showPassword ? "eye-off" : "eye"}
              className="fs-16"
            />
          </Button>
        </InputGroup>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <FormCheck>
          <Form.Check.Input
            className="form-check-input-light fs-14"
            type="checkbox"
            id="rememberMe"
            defaultChecked
          />
          <Form.Check.Label htmlFor="rememberMe" className="fs-13">
            Keep me signed in
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
          <Icon icon="log-in" />
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
