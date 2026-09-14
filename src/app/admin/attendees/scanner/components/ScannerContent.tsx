"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, Spinner, Alert, Row, Col } from "react-bootstrap";
import { useAppDispatch } from "@/redux/hooks";
import { fetchAttendeeById, updateAttendee } from "@/redux/slices/admin/attendeeSlice";
import { AttendeeRecord } from "@/app/admin/dataStore";
import Swal from "sweetalert2";
import { Icon } from "@iconify/react";
import { useSettingsContext } from "@/context/useSettingsContext";

const ScannerContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { setting } = useSettingsContext();
  const underAgeLimit = parseInt(setting('general.under_age', '10')) || 10;

  const [loading, setLoading] = useState(true);
  const [attendee, setAttendee] = useState<AttendeeRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const attendeeId = searchParams.get("attendeeId");

  useEffect(() => {
    if (!attendeeId) {
      setError("Invalid QR Code: Missing Attendee ID");
      setLoading(false);
      return;
    }

    const loadAttendee = async () => {
      try {
        const data = await dispatch(fetchAttendeeById(attendeeId)).unwrap();
        setAttendee(data);
      } catch (err: any) {
        setError(err || "Failed to load attendee details");
      } finally {
        setLoading(false);
      }
    };

    loadAttendee();
  }, [attendeeId, dispatch]);

  const handleMarkAsUsed = async () => {
    if (!attendeeId || !attendee) return;
    
    setUpdating(true);
    try {
      const payload = { 
        ticketStatus: "Used",
        checkInTime: new Date().toISOString()
      };
      await dispatch(updateAttendee({ id: attendeeId, payload })).unwrap();
      
      setAttendee({ ...attendee, ticketStatus: "Used" });
      
      Swal.fire({
        title: "Success",
        text: "Ticket marked as Used!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#6259ca"
      });
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err || "Failed to update ticket status",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading ticket details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center p-5 shadow-sm border-0">
        <Icon icon="mdi:close-circle" width="60" className="text-danger mx-auto mb-3" />
        <h4 className="text-danger mb-3">Error</h4>
        <p className="text-muted mb-4">{error}</p>
        <Button variant="primary" onClick={() => router.push("/admin/attendees")}>
          Back to Attendees
        </Button>
      </Card>
    );
  }

  if (!attendee) return null;

  const isUsed = attendee.ticketStatus === "Used";
  const isCancelled = attendee.ticketStatus === "Cancelled";

  return (
    <Card className="shadow-sm border-0 mx-auto" style={{ maxWidth: "600px" }}>
      <Card.Body className="p-5 text-center">
        <div className="mb-4">
          <Icon 
            icon={isUsed ? "mdi:ticket-confirmation" : (isCancelled ? "mdi:ticket-percent" : "mdi:qrcode-scan")} 
            width="80" 
            className={isUsed ? "text-success" : (isCancelled ? "text-danger" : "text-primary")} 
          />
        </div>
        
        <h3 className="fw-bold mb-2">{attendee.name}</h3>
        <p className="text-muted mb-4">Ticket Verification</p>

        <div className="bg-light rounded p-4 mb-4 text-start">
          <Row className="mb-3">
            <Col xs={5} className="text-muted fw-bold small text-uppercase">Ticket Status</Col>
            <Col xs={7}>
              {isUsed && <span className="badge bg-success">Used</span>}
              {isCancelled && <span className="badge bg-danger">Cancelled</span>}
              {!isUsed && !isCancelled && <span className="badge bg-primary">Unused</span>}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={5} className="text-muted fw-bold small text-uppercase">Payment Status</Col>
            <Col xs={7}>
              <span className={`badge ${attendee.paymentStatus === 'Success' ? 'bg-success' : (attendee.paymentStatus === 'Failed' ? 'bg-danger' : 'bg-warning')}`}>
                {attendee.paymentStatus}
              </span>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={5} className="text-muted fw-bold small text-uppercase">Ticket Type</Col>
            {/* show only if age <= underAgeLimit  and paymentStatus is Success */}
            {parseInt(attendee.age as string) <= underAgeLimit && attendee.paymentStatus === 'Success' && (
              <Col xs={7} className="fw-medium">For Accompanying Person (Under {underAgeLimit})</Col>
            )}
            {/* show only if age > underAgeLimit */}
            {(parseInt(attendee.age as string) > underAgeLimit || !attendee.age) && (
              <Col xs={7} className="fw-medium">{typeof attendee.ticketId === 'object' ? attendee.ticketId?.ticketName : attendee.ticketId}</Col>
            )}
          </Row>
          <Row>
            <Col xs={5} className="text-muted fw-bold small text-uppercase">Event</Col>
            <Col xs={7} className="fw-medium">{typeof attendee.eventId === 'object' ? attendee.eventId?.title : attendee.eventId}</Col>
          </Row>
        </div>

        {isCancelled ? (
          <Alert variant="danger">
            This ticket has been cancelled. Do not allow entry.
          </Alert>
        ) : attendee.paymentStatus !== "Success" ? (
          <Alert variant="warning">
            Payment status is <strong>{attendee.paymentStatus}</strong>. Entry cannot be granted.
          </Alert>
        ) : isUsed ? (
          <Alert variant="success" className="mb-0">
            <Icon icon="mdi:check-circle" className="me-2" />
            This ticket has already been used!
          </Alert>
        ) : (
          <Button 
            variant="primary" 
            size="lg" 
            className="w-100 py-3 fw-bold"
            onClick={handleMarkAsUsed}
            disabled={updating}
            style={{ backgroundColor: "#6259ca", borderColor: "#6259ca" }}
          >
            {updating ? (
              <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Updating...</>
            ) : (
              "Mark Ticket as Used"
            )}
          </Button>
        )}
        
        <div className="mt-4">
          <Button variant="link" className="text-muted text-decoration-none" onClick={() => router.push("/admin/attendees")}>
            <Icon icon="mdi:arrow-left" className="me-1" /> Back to Attendees
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ScannerContent;
