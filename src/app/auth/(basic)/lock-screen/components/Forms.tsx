"use client";
import Icon from "@/components/wrappers/Icon";
import { useState } from "react";
import {
  Button,
  Form,
  FormControl,
  FormLabel,
  InputGroup,
} from "react-bootstrap";

const Forms = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form>
      <div className="mb-3">
        <FormLabel>
          Password
          <span className="text-danger">&nbsp;*</span>
        </FormLabel>
        <InputGroup>
          <FormControl
            type={showPassword ? "text" : "password"}
            id="userPassword"
            placeholder="••••••••"
            required
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
      </div>
      <div className="d-grid">
        <Button variant="primary" type="submit" className="fw-semibold py-2">
          Unlock
        </Button>
      </div>
    </Form>
  );
};

export default Forms;
