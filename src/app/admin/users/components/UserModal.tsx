"use client";
import Icon from "@/components/wrappers/Icon";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  FormCheck,
  FormControl,
  FormLabel,
  FormSelect,
  Modal,
  Row,
} from "react-bootstrap";
import { UserRecord } from "@/app/admin/dataStore";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchGroups } from "@/redux/slices/admin/groupSlice";

interface UserModalProps {
  show: boolean;
  onHide: () => void;
  user: UserRecord | null;
  onSave: (record: UserRecord) => Promise<void>;
}


const UserModal: React.FC<UserModalProps> = ({
  show,
  onHide,
  user,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const { groups } = useAppSelector((state) => state.groups);

  const isEdit = !!user;

  const [formData, setFormData] = useState<UserRecord>({
    id: "",
    name: "",
    email: "",
    mobile: "",
    groupId: "",
    status: "Active",
    twoFactorEnabled: true,
    joinedDate: "",
    avatar: "/images/users/avatar-1.jpg",
    password: "",
    sex: "",
    memberId: "",
    username: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (groups.length === 0) {
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        id: "",
        name: "",
        email: "",
        mobile: "",
        groupId: "",
        status: "Active",
        twoFactorEnabled: true,
        joinedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        avatar: "/images/users/avatar-1.jpg",
        password: "",
        sex: "",
        memberId: "",
        username: "",
      });
    }
  }, [user, show, groups]);

  const handleChange = (field: keyof UserRecord, value: any) => {
    setFormData((prev) => {
      const nextData = { ...prev, [field]: value };
      
      if (field === "groupId") {
        // Additional side-effects for groupId change can go here
      }
      return nextData;
    });

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "Full Name is required";
    if (!formData.email?.trim()) errors.email = "Email Address is required";
    if (!formData.mobile?.trim()) errors.mobile = "Mobile Number is required";
    if (!formData.username?.trim()) errors.username = "Username is required";
    if (!formData.sex) errors.sex = "Sex is required";
    if (!formData.groupId) errors.groupId = "Group is required";
    if (!isEdit && !formData.twoFactorEnabled && !formData.password?.trim()) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload: any = { ...formData };
    if (!payload.id) delete payload.id; // delete empty string so backend generates

    try {
      setValidationErrors({});
      await onSave(payload);
    } catch (err: any) {
      if (err && err.errors) {
        setValidationErrors(err.errors);
      } else {
        import("sweetalert2").then((Swal) => {
          Swal.default.fire(
            "Error",
            err?.message || err || "Failed to save user",
            "error",
          );
        });
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-light-subtle">
          <Modal.Title className="fw-bold fs-16 d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 text-primary rounded p-2 d-flex align-items-center justify-content-center">
              <Icon
                icon={isEdit ? "user-check" : "user-plus"}
                className="fs-18"
              />
            </div>
            {isEdit ? `Edit User (${formData.id})` : "Add New"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Row className="g-4">
            <Col md={8}>
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

            <Col md={4}>
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
              <FormLabel className="fw-semibold">
                Mobile Number <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="text"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                isInvalid={!!validationErrors.mobile}
              />
              <FormControl.Feedback type="invalid">
                {validationErrors.mobile}
              </FormControl.Feedback>
            </Col>

            <Col md={4}>
              <FormLabel className="fw-semibold">
                User Group <span className="text-danger">*</span>
              </FormLabel>
              <FormSelect
                value={formData.groupId || ""}
                onChange={(e) => handleChange("groupId", e.target.value)}
                isInvalid={!!validationErrors.groupId}
              >
                <option value="">Select Group</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </FormSelect>
              <FormControl.Feedback type="invalid">
                {validationErrors.groupId}
              </FormControl.Feedback>
            </Col>



            <Col md={4}>
              <FormLabel className="fw-semibold d-block">Sex <span className="text-danger">*</span></FormLabel>
              <div className="d-flex gap-3 mt-2">
                <FormCheck
                  type="radio"
                  id="sex-male-modal"
                  label="Male"
                  name="sex-modal"
                  value="Male"
                  checked={formData.sex === "Male"}
                  onChange={(e) => handleChange("sex", e.target.value)}
                  isInvalid={!!validationErrors.sex}
                />
                <FormCheck
                  type="radio"
                  id="sex-female-modal"
                  label="Female"
                  name="sex-modal"
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

            <Col md={4}>
              <FormLabel className="fw-semibold mb-2 d-block">
                Account Status
              </FormLabel>
              <FormCheck
                type="switch"
                id="status-switch-modal"
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
                <CardBody className="py-2 px-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <h6 className="mb-1 fw-bold d-flex align-items-center gap-2">
                      <Icon
                        icon="shield-check"
                        className="text-success fs-16"
                      />{" "}
                      Two-Factor Authentication
                    </h6>
                  </div>
                  <FormCheck
                    type="switch"
                    id="two-factor-switch"
                    label={formData.twoFactorEnabled ? "Enabled" : "Disabled"}
                    checked={formData.twoFactorEnabled}
                    onChange={(e) =>
                      handleChange("twoFactorEnabled", e.target.checked)
                    }
                    className="fs-14 fw-semibold"
                    isInvalid={!!validationErrors.twoFactorEnabled}
                  />
                </CardBody>
                {validationErrors.twoFactorEnabled && (
                  <div className="text-danger fs-12 px-3 pb-2 w-100">
                    {validationErrors.twoFactorEnabled}
                  </div>
                )}
              </Card>
            </Col>

            {!isEdit && !formData.twoFactorEnabled && (
              <Col xs={12}>
                <FormLabel className="fw-semibold">
                  Password <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="password"
                  placeholder="Set password for this user..."
                  value={formData.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  isInvalid={!!validationErrors.password}
                />
                <FormControl.Feedback type="invalid">
                  {validationErrors.password}
                </FormControl.Feedback>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light-subtle">
          <Button variant="light" onClick={onHide} className="fw-semibold">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="fw-semibold d-flex align-items-center gap-1"
          >
            <Icon icon={isEdit ? "save" : "plus"} />
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UserModal;
