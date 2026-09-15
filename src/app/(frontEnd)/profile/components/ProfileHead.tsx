"use client";

import React, { useRef, useState, useEffect } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { updateFrontendProfile } from "@/redux/slices/frontEnd/userSlice";
import Image from "next/image";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const ProfileHead = () => {
  const { user } = useSelector((state: RootState) => state.frontendUser);
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [previewUrl, user?.avatar]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  const displayName = user?.name || "Member";
  const email = user?.email || "";
  const group = user?.groupName || "";
  const memberId = user?.memberId || "N/A";
  
  // Try common image property names from the user object, fallback to previewUrl if set
  const avatarUrl = previewUrl || user?.avatar || null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show immediate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profile");

    try {
      const response = await fetch("/local-api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const resData = await response.json();
        const uploadedUrl = resData.url || (resData.data && resData.data.url) || "";
        
        if (uploadedUrl) {
          setPreviewUrl(uploadedUrl); // Update preview to actual path
          // Send only required profile fields to avoid overriding valid data with empty states if any, but `user` object should be fine to merge.
          // In Account.tsx, we pass profile state. Here we can just spread user and update avatar.
          await dispatch(updateFrontendProfile({ ...user, avatar: uploadedUrl })).unwrap();
          toast.success("Profile image updated successfully!");
        } else {
          setPreviewUrl(null); // Revert on failure
          toast.error("Failed to get image URL from server.");
        }
      } else {
        setPreviewUrl(null); // Revert on failure
        toast.error("Image upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setPreviewUrl(null); // Revert on failure
      toast.error("An error occurred during image upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!avatarUrl) return;
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove your profile image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!"
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsUploading(true);
      
      // Remove from backend (MongoDB)
      await dispatch(updateFrontendProfile({ ...user, avatar: "" })).unwrap();
      
      // Delete from local file system (Next.js public folder)
      await fetch(`/local-api/upload?fileUrl=${encodeURIComponent(avatarUrl)}`, {
        method: "DELETE",
      });
      
      setPreviewUrl(null);
      toast.success("Profile image removed successfully!");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("An error occurred while removing the image.");
    } finally {
      setIsUploading(false);
    }
  };

  const getAvatarSrc = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    
    // If the url already starts with a slash (like from our /local-api/upload route which returns /uploads/profile/...)
    // Next.js <Image> works perfectly with root-relative paths for items in the public directory.
    if (url.startsWith("/")) {
      return url;
    }
    
    // Fallback for just filenames
    return `/uploads/profile/${url}`;
  };

  return (
    <div className="account-header-card p-4 p-md-5 mb-4">
      <div className="row align-items-center justify-content-center g-4">
        <div className="col-auto">
          <div 
            className="account-avatar-wrapper position-relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {(avatarUrl && !imgError) ? (
              <>
                <Image
                  src={getAvatarSrc(avatarUrl)}
                  alt={`${displayName} Profile`}
                  width={100}
                  height={100}
                  className="account-avatar"
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                  unoptimized
                  onError={() => setImgError(true)}
                />
                {isHovered && !isUploading && (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-remove-avatar">Remove Image</Tooltip>}
                  >
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "rgba(255,0,0,0.8)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 10
                      }}
                    >
                      <IconifyIcon icon="lucide:x" width="14" height="14" />
                    </button>
                  </OverlayTrigger>
                )}
              </>
            ) : (
              <div 
                className="account-avatar d-flex align-items-center justify-content-center bg-light text-secondary"
                style={{ width: "100px", height: "100px", borderRadius: "50%", fontSize: "3rem" }}
              >
                <IconifyIcon icon="lucide:user" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={handleFileChange} 
            />
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-upload-avatar">Upload Image</Tooltip>}
            >
              <button
                type="button"
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
                ) : (
                  <IconifyIcon icon="lucide:camera" width="14" height="14" />
                )}
              </button>
            </OverlayTrigger>
          </div>
        </div>

        <div className="col-auto">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <h2 className="mb-0 text-white fw-bold h3">{displayName}</h2>
          </div>
          <p className="mb-2 text-white-50 fs-6">
            Email : <strong className="text-white">{email}</strong>
          </p>
          {group && (
            <p className="mb-2 text-white-50 fs-6">
              Group : <strong className="text-white">{group}</strong>
            </p>
          )}
          <div className="d-flex flex-wrap align-items-center gap-3 text-white-50 fs-6">
            <span>
              <IconifyIcon icon="lucide:shield-check" className="me-1 text-white" />
              Member ID: <strong className="text-white">{memberId}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHead;
