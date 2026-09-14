import React, { useState } from 'react';
import { Modal, Badge, Table, Button } from 'react-bootstrap';
import { Booking, resendBookingInvoice } from '@/redux/slices/admin/bookingSlice';
import { useAppDispatch } from '@/redux/hooks';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Icon from '@/components/wrappers/Icon';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceTemplate } from "@/app/(frontEnd)/profile/components/InvoiceTemplate";
import { TicketTemplate } from "@/app/(frontEnd)/profile/components/TicketTemplate";

interface BookingDetailsModalProps {
  show: boolean;
  onHide: () => void;
  booking: Booking | null;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ show, onHide, booking }) => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [printAttendeeData, setPrintAttendeeData] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);
  const dispatch = useAppDispatch();

  const [downloadingTxn, setDownloadingTxn] = useState<any>(null);

  const handleResendInvoice = async () => {
    if (!booking) return;
    setIsResending(true);

    try {
      // Fetch transaction to get real transactionRef
      const token = typeof window !== "undefined" ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      const data = await res.json();
      const allTxns = data.data || [];
      const matchedTxn = allTxns.find((t: any) => t.bookingId?._id === (booking._id || (booking as any).id) || t.bookingId === (booking._id || (booking as any).id));
      
      const provisionalTxn = {
        id: booking._id || (booking as any).id,
        transactionRef: matchedTxn?.transactionRef || "N/A",
        date: dayjs(booking.createdAt).format('DD MMM YYYY, hh:mm A'),
        description: `Booking for ${booking.eventId?.title || 'Event'}`,
        paymentMethod: booking.paymentMethod || "N/A",
        amount: `₹ ${booking.totalAmount}`,
        status: booking.paymentStatus,
        type: "Event",
        eventName: booking.eventId?.title || 'Event',
        tickets: booking.tickets.flatMap(t => {
          const regularAttendees = t.attendees.filter(a => !(t.ticketName && t.ticketName.includes('(Under')));
          const underAgeAttendees = t.attendees.filter(a => (t.ticketName && t.ticketName.includes('(Under')));
          const items = [];
          if (regularAttendees.length > 0) {
            items.push({
              name: t.ticketName?.replace(/ \(Under \d+\)/, '') || "Event Ticket",
              quantity: regularAttendees.length,
              unitPrice: `₹ ${Number(t.price || 0).toFixed(2)}`,
              totalPrice: `₹ ${Number((t.price || 0) * regularAttendees.length).toFixed(2)}`
            });
          }
          if (underAgeAttendees.length > 0) {
            items.push({
              name: t.ticketName || "Event Ticket",
              quantity: underAgeAttendees.length,
              unitPrice: `₹ 0.00`,
              totalPrice: `₹ 0.00`
            });
          }
          if (items.length === 0) {
            items.push({
              name: t.ticketName || "Event Ticket",
              quantity: t.quantity,
              unitPrice: `₹ ${Number(t.price || 0).toFixed(2)}`,
              totalPrice: `₹ ${Number((t.price || 0) * t.quantity).toFixed(2)}`
            });
          }
          return items;
        }),
        quantity: booking.tickets.reduce((sum, t) => sum + t.quantity, 0),
        unitPrice: `₹ ${booking.totalAmount}`,
      };

      setDownloadingTxn(provisionalTxn);

      setTimeout(async () => {
        const element = document.getElementById("admin-booking-invoice-template");
        if (element) {
          try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            const pdfBase64 = pdf.output("datauristring");

            const bookingId = booking._id || (booking as any).id;
            await dispatch(resendBookingInvoice({ id: bookingId, pdfBase64 })).unwrap();
            toast.success('Invoice resent successfully');
          } catch (error: any) {
            toast.error(error?.message || error || 'Failed to resend invoice');
          } finally {
            setIsResending(false);
            setDownloadingTxn(null);
          }
        } else {
          setIsResending(false);
          setDownloadingTxn(null);
          toast.error("Failed to generate invoice template");
        }
      }, 2000);

    } catch (error: any) {
      toast.error(error?.message || error || 'Failed to process invoice resend');
      setIsResending(false);
    }
  };

  const handleDownloadTicket = async (bookingId: string, attendeeId: string, attendeeObj: any, eventDetails: any, ticketObj: any) => {
    setIsDownloading(attendeeId);
    
    let finalEventDetails = eventDetails;
    if (!finalEventDetails?.venueLocation && !finalEventDetails?.venue) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
        const eventIdStr = typeof eventDetails === 'string' ? eventDetails : (eventDetails?._id || eventDetails?.id);
        if (eventIdStr) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/events/${eventIdStr}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          const data = await res.json();
          if (data && data.data) {
            finalEventDetails = data.data;
          }
        }
      } catch (e) {
        console.error("Failed to fetch full event details", e);
      }
    }

    setPrintAttendeeData({
      attendee: { 
        ...attendeeObj, 
        ticketName: ticketObj.ticketName,
        ticketPrice: (ticketObj.ticketName && ticketObj.ticketName.includes('(Under')) ? 0 : (attendeeObj.ticketPrice ?? ticketObj.price ?? ticketObj.ticketPrice ?? 0),
        ticketStatus: attendeeObj.ticketStatus ?? attendeeObj.status ?? ticketObj.ticketStatus ?? "Unused",
        ticketId: attendeeObj.ticketId || ticketObj.ticketId || ticketObj.id || ticketObj._id,
        paymentStatus: booking?.paymentStatus || "Completed",
        bookingId: booking
      },
      eventDetails: finalEventDetails,
      bookingId
    });

    setTimeout(async () => {
      try {
        const ticketEl = document.getElementById(`admin-ticket-template-${attendeeId}`);
        if (ticketEl) {
          const tCanvas = await html2canvas(ticketEl, { scale: 2, useCORS: true, logging: true });
          const tImgData = tCanvas.toDataURL("image/png");
          const tPdf = new jsPDF("p", "mm", "a4");
          const tPdfWidth = tPdf.internal.pageSize.getWidth();
          const tPdfHeight = (tCanvas.height * tPdfWidth) / tCanvas.width;
          tPdf.addImage(tImgData, "PNG", 0, 0, tPdfWidth, tPdfHeight);
          tPdf.save(`ticket-${attendeeId}.pdf`);
        } else {
          toast.error("Could not generate PDF. Template not found.");
        }
      } catch (error: any) {
        console.error("Ticket PDF generation error", error);
        toast.error("Failed to generate ticket PDF");
      } finally {
        setIsDownloading(null);
        setPrintAttendeeData(null);
      }
    }, 2000);
  };

  if (!booking) return null;

  const getStatusColor = (status: string) => {
    if (status === 'Completed' || status === 'Free') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Failed') return 'danger';
    return 'secondary';
  };

  const bookingIdDisplay = booking._id.substring(booking._id.length - 4).toUpperCase();
  const formattedDate = dayjs(booking.createdAt).format('MMMM DD, YYYY hh:mm A');
  const eventTitle = booking.eventId?.title || 'Unknown Event';

  return (
    <>
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fs-5 fw-semibold">
          Booking ID - {bookingIdDisplay}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <div className="d-flex justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <h6 className="mb-0 fw-semibold fs-16">Billing Information</h6>
            <Badge bg={`${getStatusColor(booking.bookingStatus)}-subtle`} text={getStatusColor(booking.bookingStatus)} className="rounded-pill fw-medium px-3 py-1">
              {booking.bookingStatus}
            </Badge>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="ms-2 d-flex align-items-center gap-1"
              onClick={handleResendInvoice}
              disabled={isResending}
            >
              <Icon icon="mail" className="fs-16" />
              {isResending ? 'Sending...' : 'Resend Invoice'}
            </Button>
          </div>
          <h5 className="mb-0 fw-bold">
            ₹{booking.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h5>
        </div>

        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="fw-semibold text-dark mb-1">Name</div>
            <div className="text-muted">{booking.billingInfo?.firstName} {booking.billingInfo?.lastName || ''}</div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="fw-semibold text-dark mb-1">Email</div>
            <div className="text-muted">{booking.billingInfo?.email || '-'}</div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="fw-semibold text-dark mb-1">Phone</div>
            <div className="text-muted">{booking.billingInfo?.phone || '-'}</div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="fw-semibold text-dark mb-1">Payment Gateway</div>
            <div className="text-muted">{booking.paymentMethod || '-'}</div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="fw-semibold text-dark mb-1">Received On</div>
            <div className="text-muted">{formattedDate}</div>
          </div>
          <div className="col-md-12 mb-3">
            <div className="fw-semibold text-dark mb-1">Event</div>
            <div className="text-muted">{eventTitle}</div>
          </div>
        </div>

        <h6 className="fw-semibold mb-3 fs-16">Attendee List</h6>
        <div className="table-responsive">
          <Table className="table-centered table-nowrap mb-0 border-top">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold py-2">No.</th>
                <th className="fw-semibold py-2">Name</th>
                <th className="fw-semibold py-2">Ticket</th>
                <th className="fw-semibold py-2 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {booking.tickets.flatMap((t, tIndex) => 
                t.attendees.map((attendee, aIndex) => {
                  const globalIndex = booking.tickets.slice(0, tIndex).reduce((sum, prevT) => sum + prevT.attendees.length, 0) + aIndex;
                  const attendeeNo = `${bookingIdDisplay}${globalIndex + 1}`;
                  return (
                    <tr key={attendeeNo}>
                      <td className="py-2 text-muted">{attendeeNo}</td>
                      <td className="py-2 text-muted">{attendee.name || '-'}</td>
                      <td className="py-2 text-muted">{t.ticketName || 'Ticket'}</td>
                      <td className="text-end pe-4 py-2">
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="btn-icon border bg-transparent text-secondary p-1 rounded-2 shadow-none"
                          onClick={() => handleDownloadTicket(
                            booking._id || (booking as any).id,
                            (attendee as any)._id || attendeeNo,
                            attendee,
                            booking.eventId,
                            t
                          )}
                          disabled={isDownloading === ((attendee as any)._id || attendeeNo)}
                        >
                          {isDownloading === ((attendee as any)._id || attendeeNo) ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <Icon icon="eye" className="fs-16" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
              {(!booking.tickets || booking.tickets.length === 0 || booking.tickets.every(t => !t.attendees || t.attendees.length === 0)) && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-3">No attendees found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
    </Modal>

    {printAttendeeData && (
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div id={`admin-ticket-template-${printAttendeeData.attendee._id || printAttendeeData.attendee.id || printAttendeeData.attendee.name}`}>
          <TicketTemplate 
            attendee={printAttendeeData.attendee} 
            eventDetails={printAttendeeData.eventDetails} 
            user={{ memberId: booking.userId?.memberId || "", name: `${booking.billingInfo?.firstName || ""} ${booking.billingInfo?.lastName || ""}`.trim() || "Guest" }} 
            bookingId={printAttendeeData.bookingId} 
            pdfMode={true}
          />
        </div>
      </div>
    )}

    {downloadingTxn && (
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "800px" }}>
        <InvoiceTemplate 
          transaction={downloadingTxn} 
          user={{ 
            name: `${booking.billingInfo?.firstName || ""} ${booking.billingInfo?.lastName || ""}`.trim() || "", 
            email: booking.billingInfo?.email, 
            phone: booking.billingInfo?.phone,
            memberId: booking.userId?.memberId || ""
          }} 
          id="admin-booking-invoice-template" 
        />
      </div>
    )}
    </>
  );
};

export default BookingDetailsModal;
