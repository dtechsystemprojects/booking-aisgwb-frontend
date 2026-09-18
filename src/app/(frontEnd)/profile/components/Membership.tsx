"use client";

import React, { useState } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSettingsContext } from "@/context/useSettingsContext";
import logo from "@/assets/images/logo.png";
import { Image } from "react-bootstrap";
import dayjs from "dayjs";

const Membership = () => {
  const { user, groups } = useSelector(
    (state: RootState) => state.frontendUser,
  );
  const { setting } = useSettingsContext();
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const certificateElement = document.getElementById("certificate-content");
    if (!certificateElement) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(certificateElement, {
        scale: 2, // Retain high resolution
        useCORS: true,
        backgroundColor: "#ffffff", // Ensure background isn't transparent
      });

      const imgData = canvas.toDataURL("image/png");

      // Create PDF with exact dimensions of the canvas
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("membership_certificate_" + memberId + "pdf");

      import("react-hot-toast").then((toast) =>
        toast.default.success("Certificate Downloaded!"),
      );
    } catch (error) {
      console.error("Error generating PDF", error);
      import("react-hot-toast").then((toast) =>
        toast.default.error("Failed to generate PDF."),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const rawName = user?.name;
  const fullName = typeof rawName === "string" ? rawName.toUpperCase() : "";
  const memberId = user?.memberId || "";
  const groupName =
    user?.groupName ||
    groups?.find((g: any) => g._id === user?.groupId || g.id === user?.groupId)
      ?.name ||
    "N/A";

  const renderCertificate = (id?: string) => (
    <div
      id={id}
      className="border border-3 border-secondary p-4 p-md-5 rounded-3 position-relative"
      style={{
        borderStyle: "double",
        width: "210mm",
        height: "210mm",
        background: "linear-gradient(180deg, #ffffff 0%, #fafcfd 100%)",
      }}
    >
      <div className="d-flex justify-content-center mb-3">
        <Image
          src={setting("general.logo", logo.src)}
          alt="AISGWB Logo"
          style={{
            height: "135px",
            width: "auto",
            objectFit: "contain",
          }}
          crossOrigin="anonymous"
        />
      </div>
      <div className="display-6 fw-bold text-primary mb-2">AISGWB</div>
      <div className="fw-semibold text-uppercase tracking-wide text-dark mb-4">
        Indian Society of Gastroenterology - West Bengal Chapter
      </div>

      <h3 className="font-serif fst-italic text-secondary mb-3">
        Certificate of Life Membership
      </h3>

      <p className="text-muted mb-2">This is to certify that</p>
      <h2 className="fw-bold text-dark mb-2">{fullName}</h2>
      <p className="text-muted mb-4">
        WBMC Reg No: <strong>{memberId}</strong>
      </p>

      <p className="text-dark max-w-lg mx-auto mb-4">
        has been duly admitted as a <strong>Verified Life Member</strong> of the
        Indian Society of Gastroenterology (West Bengal Chapter) and is entitled
        to all rights and privileges granted by the constitution of the society.
      </p>

      <div className="row align-items-end mt-5 pt-3">
        <div className="col-4 text-center">
          <div className="fw-bold text-dark border-top pt-2 small">
            President, AISGWB
          </div>
        </div>
        <div className="col-4 text-center">
          {/* <div className="badge bg-warning bg-opacity-25 text-warning-emphasis p-2 border border-warning">
            SEAL OF SOCIETY
          </div> */}
        </div>
        <div className="col-4 text-center">
          <div className="fw-bold text-dark border-top pt-2 small">
            Secretary, AISGWB
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tab-pane fade show active">
      <div className="row g-4">
        {/* Digital Membership Card View */}
        <div className="col-lg-5">
          <div className="membership-card-visual mb-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              {/* <div className="card-chip"></div> */}
              <div className="card-logo">
                <Image
                  src={setting("general.logo", logo.src)}
                  alt="AISGWB"
                  crossOrigin="anonymous"
                />
              </div>
              <div>
                <div className="fw-semibold text-white tracking-wider">
                  Indian Society of Gastroenterology
                </div>
                <div className="fw-semibold text-white mb-3">
                  West Bengal Chapter
                </div>
              </div>
            </div>
            <div className="member-id-code">{memberId}</div>

            <div className="row align-items-end mt-4">
              <div className="col">
                <div className="small text-white-50">Member Name</div>
                <div className="fw-bold text-white fs-6">{fullName}</div>
              </div>
              <div className="col-auto text-end">
                <div className="small text-white-50">Valid Through</div>
                <div className="fw-bold text-white fs-6">LIFETIME</div>
              </div>
            </div>

            <IconifyIcon icon="lucide:award" className="card-watermark" />
          </div>
        </div>

        {/* Membership Benefits & Status Details */}
        <div className="col-lg-7">
          <div className="account-content-card p-3 mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom gap-2">
              <h4 className="card-header-title mb-0">
                <IconifyIcon
                  icon="lucide:shield-check"
                  className="text-success"
                />
                Membership Status & Overview
              </h4>
              <span className="badge bg-success px-3 py-2 fs-6 rounded-pill">
                Active Life Member
              </span>
            </div>

            <div className="row g-3">
              <div className="col-sm-6">
                <div className="stat-box">
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                    <IconifyIcon icon="lucide:calendar-check" />
                  </div>
                  <div>
                    <div className="text-muted small">Date of Joining</div>
                    <div className="fw-bold text-dark fs-6">
                      {(user as any)?.createdAt
                        ? dayjs((user as any).createdAt).format("DD MMMM YYYY")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="stat-box">
                  <div className="stat-icon bg-success bg-opacity-10 text-success">
                    <IconifyIcon icon="lucide:badge-check" />
                  </div>
                  <div>
                    <div className="text-muted small">Category</div>
                    {/* <div className="fw-bold text-dark fs-6">{groupName}</div> */}
                    <div className="fw-bold text-dark fs-6">
                      Life Time Membership
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="stat-box">
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                    <IconifyIcon icon="lucide:file-badge" />
                  </div>
                  <div>
                    <div className="text-muted small">Member ID</div>
                    <div className="fw-bold text-dark fs-6">{memberId}</div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="stat-box">
                  <div className="stat-icon bg-info bg-opacity-10 text-info">
                    <IconifyIcon icon="lucide:building-2" />
                  </div>
                  <div>
                    <div className="text-muted small">Chapter Region</div>
                    <div className="fw-bold text-dark fs-6">West Bengal</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-end">
              {/* <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1 me-2"
                onClick={() => setShowCertificateModal(true)}
              >
                <IconifyIcon icon="lucide:award" width="16" /> View Certificate
              </button> */}
              <button
                  type="button"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <IconifyIcon icon="lucide:download" width="16" />
                  )}
                  {isDownloading
                    ? "Generating..."
                    : "Download Certificate"}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white p-3 px-4">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <IconifyIcon icon="lucide:award" className="text-warning" />
                  Official Membership Certificate
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCertificateModal(false)}
                ></button>
              </div>

              <div
                className="modal-body p-4 p-md-5 text-center bg-white"
                style={{ overflowX: "auto" }}
              >
                {renderCertificate()}
              </div>

              <div className="modal-footer p-3 bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCertificateModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <IconifyIcon icon="lucide:download" width="16" />
                  )}
                  {isDownloading
                    ? "Generating PDF..."
                    : "Download Certificate (PDF)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN CERTIFICATE FOR DOWNLOAD */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          zIndex: -1,
        }}
        className="text-center bg-white"
      >
        {renderCertificate("certificate-content")}
      </div>
    </div>
  );
};

export default Membership;
