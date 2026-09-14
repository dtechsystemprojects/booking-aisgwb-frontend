"use client";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormCheck,
  FormControl,
  FormLabel,
  FormSelect,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import {
  initialUserGroups,
  initialUserRecords,
  UserRecord,
} from "@/app/admin/dataStore";

interface UserFormProps {
  mode: "add" | "edit";
  userId?: string;
}

const avatarOptions = [
  { id: 1, path: "/images/users/avatar-1.jpg", label: "Avatar 1" },
  { id: 2, path: "/images/users/avatar-2.jpg", label: "Avatar 2" },
  { id: 3, path: "/images/users/avatar-3.jpg", label: "Avatar 3" },
  { id: 4, path: "/images/users/avatar-4.jpg", label: "Avatar 4" },
  { id: 5, path: "/images/users/avatar-5.jpg", label: "Avatar 5" },
  { id: 6, path: "/images/users/avatar-6.jpg", label: "Avatar 6" },
];

const UserForm: React.FC<UserFormProps> = ({ mode, userId }) => {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState<UserRecord>({
    id: userId || `USR-${Math.floor(100 + Math.random() * 900)}`,
    name: "",
    email: "",
    mobile: "",
    groupId: "GRP-1",
    status: "Active",
    twoFactorEnabled: true,
    joinedDate: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    avatar: "/images/users/avatar-1.jpg",
    sex: "",
    memberId: "",
    username: "",
  });

  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && userId) {
      const found = initialUserRecords.find((u) => u.id === userId);
      if (found) {
        setFormData(found);
      }
    }
  }, [isEdit, userId]);

  const handleChange = (field: keyof UserRecord, value: any) => {
    setFormData((prev) => {
      const nextData = { ...prev, [field]: value };
      
      if (field === "groupId") {
        const selectedGroup = initialUserGroups.find((g) => g.id === value);
        if (selectedGroup && selectedGroup.name !== "Member") {
          nextData.memberId = `MEM-${Math.floor(10000 + Math.random() * 90000)}`;
        } else if (selectedGroup && selectedGroup.name === "Member") {
          nextData.memberId = ""; // clear so they can enter it manually
        }
      }
      return nextData;
    });

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isMemberGroup = initialUserGroups.find((g) => g.id === formData.groupId)?.name === "Member";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "Full Name is required";
    if (!formData.email?.trim()) errors.email = "Email Address is required";
    if (!formData.mobile?.trim()) errors.mobile = "Mobile Number is required";
    if (!formData.username?.trim()) errors.username = "Username is required";
    if (!formData.sex) errors.sex = "Sex is required";
    if (!formData.groupId) errors.groupId = "User Group is required";
    if (isMemberGroup && !formData.memberId?.trim()) errors.memberId = "Member ID is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMessage(
        "Please complete all mandatory fields marked with an asterisk (*)."
      );
      import("sweetalert2").then((Swal) => {
        Swal.default.fire(
          "Validation Error",
          "Please complete all mandatory fields marked with an asterisk (*).",
          "warning"
        );
      });
      return;
    }
    setValidationErrors({});
    setErrorMessage("");
    setSaved(true);
    setTimeout(() => {
      router.push("/admin/users");
    }, 1200);
  };

  return (
    <>
      <PageBreadcrumb
        title={isEdit ? `Edit User (${formData.id})` : "Add New User"}
        subtitle="User Management"
      />

      {errorMessage && (
        <Alert
          variant="danger"
          className="d-flex align-items-center gap-2 mb-3"
          onClose={() => setErrorMessage("")}
          dismissible
        >
          <Icon icon="alert-circle" className="fs-18 flex-shrink-0" />
          <span>{errorMessage}</span>
        </Alert>
      )}

      {saved && (
        <Alert
          variant="success"
          className="d-flex align-items-center gap-2 mb-3"
        >
          <Icon icon="check-circle" className="fs-18 flex-shrink-0" />
          <span>
            User &quot;{formData.name || "New User"}&quot;{" "}
            {isEdit ? "updated" : "created"} successfully! Redirecting to Users
            List...
          </span>
        </Alert>
      )}

      <Row className="justify-content-center">
        <Col lg={10}>
          <form onSubmit={handleSubmit}>
            <Card className="mb-4 border-0 shadow-sm">
              <CardHeader className="d-flex justify-content-between align-items-center bg-light-subtle py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-2 d-flex align-items-center justify-content-center">
                    <Icon
                      icon={isEdit ? "user-check" : "user-plus"}
                      className="fs-20"
                    />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">
                      {isEdit
                        ? `Update User Profile (${formData.id})`
                        : "User Profile & Setup"}
                    </h5>
                    <small className="text-muted">
                      Configure account credentials, department roles, and OTP
                      access
                    </small>
                  </div>
                </div>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="tooltip-back-to-list">
                      Return to User List Table
                    </Tooltip>
                  }
                >
                  <Link
                    href="/admin/users"
                    className="btn btn-light btn-sm d-flex align-items-center gap-1 fw-semibold"
                  >
                    <Icon icon="arrow-left" /> Back to User List
                  </Link>
                </OverlayTrigger>
              </CardHeader>

              <CardBody className="p-4">
                <Row className="g-4">
                  <Col md={6}>
                    <FormLabel className="fw-semibold">
                      Full Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter user full name..."
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      isInvalid={!!validationErrors.name}
                    />
                    <FormControl.Feedback type="invalid">
                      {validationErrors.name}
                    </FormControl.Feedback>
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold">
                      Username <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter username"
                      value={formData.username || ""}
                      onChange={(e) => handleChange("username", e.target.value)}
                      isInvalid={!!validationErrors.username}
                    />
                    <FormControl.Feedback type="invalid">
                      {validationErrors.username}
                    </FormControl.Feedback>
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold">
                      Email Address <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      isInvalid={!!validationErrors.email}
                    />
                    <FormControl.Feedback type="invalid">
                      {validationErrors.email}
                    </FormControl.Feedback>
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold">Mobile Number <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      isInvalid={!!validationErrors.mobile}
                    />
                    <FormControl.Feedback type="invalid">
                      {validationErrors.mobile}
                    </FormControl.Feedback>
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold">
                      Member ID {isMemberGroup && <span className="text-danger">*</span>}
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder={isMemberGroup ? "Enter member ID (e.g., MEM-001)" : "Auto-generated"}
                      value={formData.memberId || ""}
                      onChange={(e) => handleChange("memberId", e.target.value)}
                      readOnly={!isMemberGroup}
                      isInvalid={!!validationErrors.memberId}
                    />
                    <FormControl.Feedback type="invalid">
                      {validationErrors.memberId}
                    </FormControl.Feedback>
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold d-block">Sex <span className="text-danger">*</span></FormLabel>
                    <div className="d-flex gap-3 mt-2">
                      <FormCheck
                        type="radio"
                        id="sex-male-form"
                        label="Male"
                        name="sex-form"
                        value="Male"
                        checked={formData.sex === "Male"}
                        onChange={(e) => handleChange("sex", e.target.value)}
                        isInvalid={!!validationErrors.sex}
                      />
                      <FormCheck
                        type="radio"
                        id="sex-female-form"
                        label="Female"
                        name="sex-form"
                        value="Female"
                        checked={formData.sex === "Female"}
                        onChange={(e) => handleChange("sex", e.target.value)}
                        isInvalid={!!validationErrors.sex}
                      />
                    </div>
                    {validationErrors.sex && (
                      <div className="text-danger fs-12 mt-1">
                        {validationErrors.sex}
                      </div>
                    )}
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold">
                      User Group / Role <span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      value={formData.groupId || ""}
                      onChange={(e) => handleChange("groupId", e.target.value)}
                      isInvalid={!!validationErrors.groupId}
                    >
                      {initialUserGroups.map((grp) => (
                        <option key={grp.id} value={grp.id}>
                          {grp.name}
                        </option>
                      ))}
                    </FormSelect>
                    <FormControl.Feedback type="invalid">
                      {validationErrors.groupId}
                    </FormControl.Feedback>
                  </Col>

                  <Col md={6}>
                    <FormLabel className="fw-semibold mb-2 d-block">
                      Account Status
                    </FormLabel>
                    <FormCheck
                      type="switch"
                      id="status-switch-form"
                      label={formData.status === "Active" ? "Active" : "Inactive"}
                      checked={formData.status === "Active"}
                      onChange={(e) =>
                        handleChange(
                          "status",
                          e.target.checked ? "Active" : "Inactive"
                        )
                      }
                      className="fs-15 fw-semibold mt-1"
                      isInvalid={!!validationErrors.status}
                    />
                    {validationErrors.status && (
                      <div className="text-danger fs-12 mt-1">
                        {validationErrors.status}
                      </div>
                    )}
                  </Col>

                  <Col xs={12}>
                    <Card className="bg-light-subtle border-light">
                      <CardBody className="py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                          <h6 className="mb-1 fw-bold d-flex align-items-center gap-2">
                            <Icon
                              icon="shield-check"
                              className="text-success fs-18"
                            />{" "}
                            Two-Factor Authentication (OTP / 2FA)
                          </h6>
                          <p className="text-muted fs-13 mb-0">
                            Require one-time verification passcode via email or
                            SMS on login
                          </p>
                        </div>
                        <FormCheck
                          type="switch"
                          id="two-factor-switch"
                          label={
                            formData.twoFactorEnabled ? "Enabled" : "Disabled"
                          }
                          checked={formData.twoFactorEnabled}
                          onChange={(e) =>
                            handleChange("twoFactorEnabled", e.target.checked)
                          }
                          className="fs-15 fw-semibold"
                          isInvalid={!!validationErrors.twoFactorEnabled}
                        />
                      </CardBody>
                      {validationErrors.twoFactorEnabled && (
                        <div className="text-danger fs-12 px-4 pb-3 w-100">
                          {validationErrors.twoFactorEnabled}
                        </div>
                      )}
                    </Card>
                  </Col>

                  <Col xs={12}>
                    <FormLabel className="fw-semibold mb-2">
                      Select Profile Avatar
                    </FormLabel>
                    <div className="d-flex flex-wrap gap-3">
                      {avatarOptions.map((av) => (
                        <div
                          key={av.id}
                          onClick={() => handleChange("avatar", av.path)}
                          style={{ cursor: "pointer" }}
                          className={`p-1 rounded border ${formData.avatar === av.path ? "border-primary bg-primary bg-opacity-10" : "border-light"}`}
                        >
                          <div
                            className="avatar-md rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center fw-bold fs-14"
                            style={{ width: "48px", height: "48px" }}
                          >
                            A{av.id}
                          </div>
                        </div>
                      ))}
                    </div>
                    {validationErrors.avatar && (
                      <div className="text-danger fs-12 mt-2">
                        {validationErrors.avatar}
                      </div>
                    )}
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-cancel-form">
                        Discard Changes and Return
                      </Tooltip>
                    }
                  >
                    <Link href="/admin/users" className="btn btn-light px-4">
                      Cancel
                    </Link>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-submit-form">
                        {isEdit
                          ? "Save User Profile Changes"
                          : "Create New User Account"}
                      </Tooltip>
                    }
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      className="px-4 fw-semibold d-flex align-items-center gap-1"
                    >
                      <Icon icon={isEdit ? "save" : "plus"} />
                      {isEdit ? "Save Changes" : "Create User"}
                    </Button>
                  </OverlayTrigger>
                </div>
              </CardBody>
            </Card>
          </form>
        </Col>
      </Row>
    </>
  );
};

export default UserForm;
