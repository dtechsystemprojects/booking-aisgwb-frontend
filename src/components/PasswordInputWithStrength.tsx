"use client";
import Icon from "@/components/wrappers/Icon";
import { useState } from "react";
import { Button, FormControl, FormLabel, InputGroup } from "react-bootstrap";

type PasswordInputProps = {
  password: string;
  setPassword: (value: string) => void;
  showIcon?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  label?: string;
  labelClassName?: string;
  inputClassName?: string;
};

const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[\W_]/.test(password)) strength++;
  return strength;
};

const PasswordInputWithStrength = ({
  password,
  setPassword,
  id,
  label,
  name,
  placeholder,
  showIcon,
  labelClassName,
  inputClassName,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = calculatePasswordStrength(password);
  const strengthBars = new Array(4).fill(0);

  return (
    <>
      {label && (
        <FormLabel htmlFor={id} className={labelClassName}>
          {label} <span className="text-danger">*</span>
        </FormLabel>
      )}

      <InputGroup>
        {showIcon && (
          <InputGroup.Text className="bg-light text-muted">
            <Icon icon="lock" />
          </InputGroup.Text>
        )}
        <FormControl
          type={showPassword ? "text" : "password"}
          name={name}
          id={id}
          placeholder={placeholder}
          required
          className={inputClassName}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="light"
          type="button"
          className="border d-flex align-items-center justify-content-center text-muted px-3"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide password" : "Show password"}
        >
          <Icon icon={showPassword ? "eye-off" : "eye"} className="fs-16" />
        </Button>
      </InputGroup>

      <div className="password-bar my-2">
        {strengthBars.map((_, i) => (
          <div
            key={i}
            className={
              "strong-bar " + (i < strength ? `bar-active-${strength}` : "")
            }
          />
        ))}
      </div>

      <p className="text-muted fs-xs mb-0">
        Use 8+ characters with letters, numbers & symbols.
      </p>
    </>
  );
};

export default PasswordInputWithStrength;
