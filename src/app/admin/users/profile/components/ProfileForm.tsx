"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  FormControl,
  FormLabel,
  Row,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import Icon from "@/components/wrappers/Icon";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateUser } from "@/redux/slices/admin/userSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import Swal from "sweetalert2";

const ProfileForm = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    mobile: "",
    avatar: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        id: currentUser.id || currentUser._id || "",
        name: currentUser.name || currentUser.fullName || "",
        email: currentUser.email || "",
        mobile: currentUser.mobile || currentUser.phone || "",
        avatar: (currentUser.avatar && currentUser.avatar !== "null") ? currentUser.avatar : "",
      });
      setImagePreview((currentUser.avatar && currentUser.avatar !== "null") ? currentUser.avatar : "");
    }
  }, [currentUser]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          const res = await fetch(`/local-api/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileBase64: base64String,
              fileName: file.name,
              folder: "profile"
            }),
          });
          const data = await res.json();
          const uploadedUrl = data?.data?.url || data?.url || "";
          if (res.ok && uploadedUrl) {
            handleChange("avatar", uploadedUrl);
            setImagePreview(uploadedUrl);
          } else {
            setErrorMessage(`Upload failed: ${data.message || "Could not get URL."}`);
            setImagePreview(formData.avatar || "");
          }
        } catch (err: any) {
          console.error("Upload error:", err);
          setErrorMessage(`Upload error: ${err.message || "Network issue"}`);
          setImagePreview(formData.avatar || "");
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        setErrorMessage("Failed to read the selected file.");
        setImagePreview(formData.avatar || "");
      };
      
      reader.readAsDataURL(file);
    } catch (outerError) {
      setIsUploading(false);
      console.error(outerError);
      setErrorMessage("Failed to initialize upload.");
      setImagePreview(formData.avatar || "");
    }
  };

  const handleRemoveImage = async () => {
    const result = await Swal.fire({
      title: "Remove Photo?",
      text: "Are you sure you want to remove your profile photo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      if (formData.avatar) {
        try {
          let deleteUrl = formData.avatar;
          if (!deleteUrl.startsWith('/')) {
            deleteUrl = `/uploads/profile/${deleteUrl}`;
          }
          const response = await fetch(`/local-api/upload?fileUrl=${encodeURIComponent(deleteUrl)}`, {
            method: "DELETE",
          });
          const resData = await response.json();
          if (resData.success || response.status === 404) {
            Swal.fire({
              title: "Removed!",
              text: "Your profile photo has been cleared.",
              icon: "success",
              confirmButtonColor: "#3e60d5",
            });
            handleChange("avatar", "");
            setImagePreview("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          } else {
             Swal.fire({
              title: "Notice",
              text: resData.message || "Could not delete from storage, but removed from profile.",
              icon: "warning",
              confirmButtonColor: "#3e60d5",
            });
            handleChange("avatar", "");
            setImagePreview("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        } catch (e) {
          console.error("Failed to delete image", e);
          Swal.fire({
            title: "Error!",
            text: "Failed to remove the photo from storage.",
            icon: "error",
            confirmButtonColor: "#3e60d5",
          });
        }
      } else {
        // If there was no avatar on the server, just clear the local preview
        handleChange("avatar", "");
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const getImageSrc = (url: string | null | undefined) => {
    if (!url || url === "null" || url === "undefined" || url.includes("/images/users/avatar-")) return "";
    if (
      url.startsWith("blob:") ||
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    ) {
      return url;
    }
    return `/uploads/${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.email?.trim()) errors.email = "Email is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMessage("Please complete all mandatory fields.");
      return;
    }

    setValidationErrors({});
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!formData.id) {
        throw new Error("User ID is missing.");
      }
      const result = await dispatch(updateUser(formData)).unwrap();
      
      // Update the current logged-in user session with the new data
      dispatch(setCredentials({ user: { ...currentUser, ...result } as any, token: token || undefined }));

      Swal.fire({
        title: "Success",
        text: "Your profile has been updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const msg = err?.message || "Failed to update profile.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-light-subtle py-3 px-4">
        <CardTitle as="h5" className="mb-0 fw-bold d-flex align-items-center gap-2">
          <Icon icon="user-check" className="fs-20 text-primary" />
          Edit Personal Information
        </CardTitle>
      </CardHeader>
      <CardBody className="p-4">
        {errorMessage && (
          <Alert
            variant="danger"
            className="d-flex align-items-center gap-2 mb-4"
            onClose={() => setErrorMessage("")}
            dismissible
          >
            <Icon icon="alert-circle" className="fs-18 flex-shrink-0" />
            <span>{errorMessage}</span>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col xs={12}>
              <FormLabel className="fw-semibold">Profile Photo</FormLabel>
              <div className="d-flex align-items-start gap-4">
                <div className="position-relative" style={{ width: 100, height: 100, flexShrink: 0 }}>
                  <div
                    className="position-relative border rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center w-100 h-100"
                  >
                    {imagePreview ? (
                      <Image
                        src={getImageSrc(imagePreview)}
                        alt="Profile Preview"
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <Icon icon="user" className="text-secondary opacity-50" style={{ fontSize: "3rem" }} />
                    )}
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      className="btn btn-danger position-absolute p-0 d-flex align-items-center justify-content-center rounded-circle shadow"
                      style={{ width: 24, height: 24, top: 0, right: 0, zIndex: 10 }}
                      onClick={handleRemoveImage}
                    >
                      <Icon icon="x" className="fs-12" />
                    </button>
                  )}
                </div>
                <div className="flex-grow-1">
                  <FormControl
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/webp"
                    className={`form-control ${validationErrors.avatar ? "is-invalid" : ""}`}
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="text-primary mt-2 fs-14 fw-semibold d-flex align-items-center">
                      <Spinner size="sm" animation="border" className="me-2" />
                      Uploading photo...
                    </div>
                  )}
                  <small className="text-muted fs-12 d-block mt-2">
                    Accepted formats: PNG, JPG, JPEG, WEBP. Max size: 2MB.
                  </small>
                </div>
              </div>
            </Col>

            <Col md={4}>
              <FormLabel className="fw-semibold">
                Full Name <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="text"
                placeholder="Enter your full name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                isInvalid={!!validationErrors.name}
              />
              <FormControl.Feedback type="invalid">
                {validationErrors.name}
              </FormControl.Feedback>
            </Col>

            <Col md={4}>
              <FormLabel className="fw-semibold">
                Email Address <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="email"
                placeholder="Enter your email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                isInvalid={!!validationErrors.email}
              />
              <FormControl.Feedback type="invalid">
                {validationErrors.email}
              </FormControl.Feedback>
            </Col>

            <Col md={4}>
              <FormLabel className="fw-semibold">Mobile Number</FormLabel>
              <FormControl
                type="text"
                placeholder="e.g. +91 1234567890"
                value={formData.mobile || ""}
                onChange={(e) => handleChange("mobile", e.target.value)}
              />
            </Col>
            
            <Col xs={12} className="mt-5 text-end">
              <Button
                type="submit"
                variant="primary"
                className="px-4 fw-semibold d-inline-flex align-items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Icon icon="save" /> Save Profile
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default ProfileForm;
