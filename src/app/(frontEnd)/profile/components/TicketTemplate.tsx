import React, { forwardRef } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import logo from "@/assets/images/logo.png";
import { setting } from "@/context/useSettingsContext";

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
      className={`conference-pass p-4 ${pdfMode ? '' : 'w-100'}`}
    >
      <div className="event-header justify-content-center">
        <div className="left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setting("general.logo", logo.src)}
            alt="Event Logo" 
            className="event-logo"
            crossOrigin="anonymous"
          />
        </div>
        <div className="right">
          <h1 className="event-title">{eventTitle}</h1>
          <div className="event-meta">Venue: {eventVenue}</div>
          <div className="event-meta">{eventDateStr}</div>
        </div>
      </div>

      <div className="details-section">
        <div className="lefts">
          <div className="left1">
            <div className="detail-item">
              <span className="detail-label">BOOKED BY :</span>
              <span className="detail-value">{user?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">TYPE :</span>
              <span className="detail-value">{attendee.ticketName || ''}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">PAYMENT STATUS :</span>
              <span className="detail-value">{attendee.paymentStatus || ''}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ATTENDEE :</span>
              <span className="detail-value">{attendee.name}</span>
            </div>
          </div>
          <div className="right1">
            <div className="detail-item">
              <span className="detail-label">MEMBERSHIP ID :</span>
              <span className="detail-value">{user?.memberId || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">PRICE :</span>
              <span className="detail-value">{attendee.ticketPrice == 0 || !attendee.ticketPrice ? "FREE" : `₹ ${attendee.ticketPrice}`}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">STATUS :</span>
              <span className="detail-value">{attendee.ticketStatus || ''}</span>
            </div>
            {(attendee.age || attendee.relation) ? (
              <>
                {attendee.age && (
                  <div className="detail-item">
                    <span className="detail-label">AGE :</span>
                    <span className="detail-value">{attendee.age}</span>
                  </div>
                )}
                {attendee.relation && (
                  <div className="detail-item">
                    <span className="detail-label">RELATION :</span>
                    <span className="detail-value">{attendee.relation}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="detail-item" style={{ visibility: 'hidden' }}>
                <span className="detail-label">-</span>
                <span className="detail-value">-</span>
              </div>
            )}
          </div>
        </div>
        <div className="rights">
          <div className="col-md-auto">
            <div className="qr-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="qr-image" 
                crossOrigin="anonymous"
              />
              <div className="qr-title">SCAN QR CODE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="notice-section">
        <p className="notice-gap">{setting('general.ticket_description', '')}</p>
      </div>
      <div className="footer-info">
        {setting('seo.meta_description', '')}<br />
        {setting('general.website_address', '')}<br />
        Contact No. {setting('general.contact', '')} Email: {setting('general.support_email', '')} Website: {setting('general.website_url', '')}
      </div>
    </div>
  );
});

TicketTemplate.displayName = "TicketTemplate";
