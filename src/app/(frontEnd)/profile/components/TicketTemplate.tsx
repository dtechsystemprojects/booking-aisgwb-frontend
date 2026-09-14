import React, { forwardRef } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import logo from "@/assets/images/logo.png";
import { setting } from "@/context/useSettingsContext";
import { Row, Col } from "react-bootstrap";

interface TicketTemplateProps {
  attendee: any;
  eventDetails: any;
  user: any;
  pdfMode?: boolean;
  bookingId?: string;
}

export const TicketTemplate = forwardRef<HTMLDivElement, TicketTemplateProps>(({ attendee, eventDetails, user, pdfMode }, ref) => {
  const eventTitle = eventDetails?.title || "Event Title";
  const eventVenue = eventDetails?.venueLocation || eventDetails?.venue || "Venue TBD";
  
  let eventDateStr = "Date TBD";
  if (eventDetails?.startDate && eventDetails?.endDate) {
    const start = dayjs(eventDetails.startDate).format("MMMM DD, YYYY");
    const end = dayjs(eventDetails.endDate).format("MMMM DD, YYYY");
    
    let startTime = eventDetails.startTime;
    if (!startTime) {
      const parsedStart = dayjs(eventDetails.startDate);
      startTime = parsedStart.isValid() && parsedStart.hour() !== 0 ? parsedStart.format("hh:mm A") : "10:00 AM";
    } else {
      const [h, m] = startTime.split(':');
      if (h && m) {
        const hour = parseInt(h, 10);
        const formattedHour = hour % 12 || 12;
        startTime = `${String(formattedHour).padStart(2, '0')}:${m}`;
      }
    }
    
    let endTime = eventDetails.endTime;
    if (!endTime) {
      const parsedEnd = dayjs(eventDetails.endDate);
      endTime = parsedEnd.isValid() && parsedEnd.hour() !== 0 ? parsedEnd.format("hh:mm A") : "06:00 PM";
    } else {
      const [h, m] = endTime.split(':');
      if (h && m) {
        const hour = parseInt(h, 10);
        const formattedHour = hour % 12 || 12;
        endTime = `${String(formattedHour).padStart(2, '0')}:${m}`;
      }
    }

    eventDateStr = `${start} - ${end} @ ${startTime} - ${endTime}`;
  }

  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || '');
  const tId = typeof attendee?.ticketId === 'string' ? attendee.ticketId : (attendee?.ticketId?._id || attendee?.ticketId?.id || '');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
      `${frontendUrl}/admin/attendees/scanner?eventId=${eventDetails?.id || eventDetails?._id || ''}&attendeeId=${attendee?.id || attendee?._id || 'temp'}&ticketId=${tId}`
  )}`;

  return (
    <div 
      ref={ref} 
      className={`ticket-print-area p-4 bg-white ${pdfMode ? '' : 'w-100'}`}
      style={pdfMode ? { width: "800px", maxWidth: "800px", minWidth: "800px" } : {}}
    >
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="d-flex align-items-center gap-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={setting("general.logo", logo.src)} 
              alt="Event Logo" 
              width="86"
              height="135"
              style={{ objectFit: 'contain' }} 
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <h5 className="fw-bold mb-1" style={{ color: "#0a266b", lineHeight: '1.4', maxWidth: '500px' }}>
              {eventTitle}
            </h5>
            <div className="text-muted small mb-1">
              Venue: {eventVenue}
            </div>
            <div className="text-muted small">
              {eventDateStr}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="d-inline-block border rounded p-1 bg-white mb-1 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={qrUrl} 
              alt="QR Code" 
              width="100" 
              height="100" 
              crossOrigin="anonymous"
            />
          </div>
          <div className="fw-bold text-dark" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scan QR Code</div>
        </div>
      </div>

      <div
        className="border-top my-4"
        style={{ borderColor: "#e9ecef", borderStyle: "dashed", borderWidth: "1px" }}
      ></div>

      {/* Row 1: Booked By, Membership ID, Price */}
      <Row className="mb-0">
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '90px', fontSize: '12px', textTransform: 'uppercase' }}>BOOKED BY :</span>
            <span className="text-muted" style={{ fontSize: '13px', wordBreak: 'break-word' }}>{user?.name || 'N/A'}</span>
          </div>
        </Col>
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '115px', fontSize: '12px', textTransform: 'uppercase' }}>MEMBERSHIP ID :</span>
            <span className="text-muted" style={{ fontSize: '13px', wordBreak: 'break-word' }}>{user?.memberId || 'N/A'}</span>
          </div>
        </Col>
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '60px', fontSize: '12px', textTransform: 'uppercase' }}>PRICE :</span>
            <span className="text-muted" style={{ fontSize: '13px' }}>
              {attendee.ticketPrice == 0 || !attendee.ticketPrice ? "FREE" : `₹ ${attendee.ticketPrice}`}
            </span>
          </div>
        </Col>
      </Row>

      {/* Row 2: Attendee, Age, Relation */}
      <Row className="mb-0">
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '90px', fontSize: '12px', textTransform: 'uppercase' }}>ATTENDEE :</span>
            <span className="text-muted" style={{ fontSize: '13px', wordBreak: 'break-word' }}>{attendee.name}</span>
          </div>
        </Col>
        {attendee.age && (
          <Col sm={4}>
            <div className="d-flex mb-3">
              <span className="fw-bold text-dark" style={{ width: '60px', fontSize: '12px', textTransform: 'uppercase' }}>AGE :</span>
              <span className="text-muted" style={{ fontSize: '13px' }}>{attendee.age}</span>
            </div>
          </Col>
        )}
        {attendee.relation && (
          <Col sm={4}>
            <div className="d-flex mb-3">
              <span className="fw-bold text-dark" style={{ width: '80px', fontSize: '12px', textTransform: 'uppercase' }}>RELATION :</span>
              <span className="text-muted" style={{ fontSize: '13px', wordBreak: 'break-word' }}>{attendee.relation}</span>
            </div>
          </Col>
        )}
      </Row>

      {/* Row 3: Type, Payment Status */}
      <Row className="mb-3">
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '90px', fontSize: '12px', textTransform: 'uppercase' }}>TYPE :</span>
            <span className="text-muted" style={{ fontSize: '13px' }}>{attendee.ticketName || 'For Accompanying Person'}</span>
          </div>
        </Col>
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '130px', fontSize: '12px', textTransform: 'uppercase' }}>PAYMENT STATUS :</span>
            <span className="text-muted" style={{ fontSize: '13px' }}>{attendee.paymentStatus || 'Completed'}</span>
          </div>
        </Col>
        <Col sm={4}>
          <div className="d-flex mb-3">
            <span className="fw-bold text-dark" style={{ width: '80px', fontSize: '12px', textTransform: 'uppercase' }}>STATUS :</span>
            <span className="text-muted" style={{ fontSize: '13px', textTransform: 'capitalize' }}>{attendee.ticketStatus || ''}</span>
          </div>
        </Col>
      </Row>

      <div className="text-center mb-4">
        <div className="text-dark fw-bold mb-3" style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
          {setting('general.ticket_description', '')}
        </div>
      </div>

      <div className="text-center text-muted" style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
        {setting('seo.meta_description', '')}<br />
        {setting('general.website_address', '')}<br />
        Contact No. {setting('general.contact', '')} Email: {setting('general.support_email', '')} Website: {setting('general.website_url', '')}
      </div>
    </div>
  );
});

TicketTemplate.displayName = "TicketTemplate";
