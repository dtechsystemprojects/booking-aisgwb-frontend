"use client";
import OTPInput from "@/components/OTPInput";
import PasswordInputWithStrength from "@/components/PasswordInputWithStrength";
import Icon from "@/components/wrappers/Icon";
import { useState } from "react";
import {
  Button,
  Form,
  FormCheck,
  FormControl,
  FormLabel,
  InputGroup,
} from "react-bootstrap";

const NewPassForm = () => {
  const [password, setPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));

  return (
    <Form>
      <div className="mb-3">
        <FormLabel>
          Email address
          <span className="text-danger ms-1">*</span>
        </FormLabel>
        <div className="input-group">
          <FormControl type="email" placeholder="you@example.com" disabled />
        </div>
      </div>
      <div className="mb-3">
        <OTPInput
          code={code}
          setCode={setCode}
          label="Enter your 6-digit code"
        />
      </div>
      <div className="mb-3" data-password="bar">
        <PasswordInputWithStrength
          id="userPassword"
          label="Password"
          name="user-password"
          password={password}
          setPassword={setPassword}
          showIcon
          placeholder="••••••••"
        />
      </div>
      <div className="mb-3">
        <FormLabel>
          Confirm New Password
          <span className="text-danger ms-1">*</span>
        </FormLabel>
        <InputGroup>
          <FormControl
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            required
          />
          <Button
            variant="light"
            type="button"
            className="border d-flex align-items-center justify-content-center text-muted px-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            title={showConfirmPassword ? "Hide password" : "Show password"}
          >
            <Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              className="fs-16"
            />
          </Button>
        </InputGroup>
      </div>
      <div className="mb-3">
        <FormCheck className="form-check">
          <Form.Check.Input
            className="form-check-input-light fs-14"
            type="checkbox"
            id="termAndPolicy"
          />
          <FormCheck.Label htmlFor="termAndPolicy">
            Agree the Terms &amp; Policy
          </FormCheck.Label>
        </FormCheck>
      </div>
      <div className="d-grid">
        <Button variant="primary" type="submit" className="fw-semibold py-2">
          Update Password
        </Button>
      </div>
    </Form>
  );
};

export default NewPassForm;
