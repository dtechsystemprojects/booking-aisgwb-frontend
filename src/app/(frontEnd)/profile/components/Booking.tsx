"use client";

import React, { useState, useEffect } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchFrontendBookings } from "@/redux/slices/frontEnd/bookingSlice";
import { TicketTemplate } from "./TicketTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Image from "next/image";

interface OrderItem {
  id: string;
  eventName: string;
  bookingDate: string;
  eventDate: string;
  venue: string;
  attendeesCount: number;
  totalPrice: string;
  status: string;
  category: string;
  rawBooking: any;
}

const Booking = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.frontendUser);
  const { bookings, loading: bookingsLoading } = useSelector((state: RootState) => state.frontendBooking);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<OrderItem | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [printAttendeeData, setPrintAttendeeData] = useState<{ attendee: any, eventDetails: any, bookingId: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    dispatch(fetchFrontendBookings());
  }, [dispatch]);

  if (!isLoaded) return null; // Avoid hydration mismatch


  const handleDownloadTicket = async (bookingId: string, attendeeId: string, attendeeObj: any, eventDetails: any, ticketObj: any) => {
    setIsDownloading(attendeeId);
    
    // Set the state so the hidden TicketTemplate mounts
    setPrintAttendeeData({
      attendee: { 
        ...attendeeObj, 
        ticketName: ticketObj.ticketName,
        ticketPrice: attendeeObj.ticketPrice ?? ticketObj.price ?? ticketObj.ticketPrice,
        ticketStatus: attendeeObj.ticketStatus ?? attendeeObj.status ?? ticketObj.ticketStatus ?? "Unused",
        ticketId: attendeeObj.ticketId || ticketObj.ticketId || ticketObj.id || ticketObj._id,
        paymentStatus: attendeeObj.paymentStatus || ticketObj.paymentStatus || bookings.find((b: any) => b._id === bookingId || b.id === bookingId)?.paymentStatus
      },
      eventDetails,
      bookingId
    });

    setTimeout(async () => {
      try {
        const ticketEl = document.getElementById(`profile-ticket-template-${attendeeId}`);
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
    }, 500);
  };

  // Map Redux Bookings to UI Format
  const orders: OrderItem[] = bookings.map((b: any) => ({
    id: b._id,
    eventName: b.eventId?.title || "Unknown Event",
    bookingDate: dayjs(b.createdAt).format('DD MMMM YYYY, hh:mm A'),
    eventDate: b.eventId?.startDate ? dayjs(b.eventId.startDate).format('DD MMM YYYY, hh:mm A') : "",
    venue: b.eventId?.venueLocation || "TBD",
    attendeesCount: Array.isArray(b.tickets) ? b.tickets.reduce((acc: number, t: any) => acc + (t.quantity || 1), 0) : 1,
    totalPrice: `₹ ${b.totalAmount || 0}`,
    status: (b.paymentStatus === 'Completed' || b.paymentStatus === 'Failed' || b.paymentStatus === 'Free') ? b.paymentStatus : 'Pending',
    category: b.eventId?.category || "Event",
    rawBooking: b,
  }));

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.eventName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || ord.status.toLowerCase() === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tab-pane fade show active">
      <div className="account-content-card p-3 p-md-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom gap-3">
          <div>
            <h4 className="card-header-title mb-1">
              <IconifyIcon icon="lucide:ticket" className="text-primary" />
              Event & Conference Registrations
            </h4>
            <p className="text-muted small mb-0">View tickets, registration details, and download receipts for your bookings.</p>
          </div>

          {/* Filter and Search Bar */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "240px" }}>
              <span className="input-group-text bg-white">
                <IconifyIcon icon="lucide:search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search event or booking ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: "140px" }}
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>

        {bookingsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Fetching your bookings...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <IconifyIcon icon="lucide:calendar-x" width="48" className="text-muted mb-3" />
            <h5 className="fw-semibold text-muted">No booking found</h5>
            <p className="text-muted small">Try adjusting your search criteria or register for upcoming events.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table account-table align-middle">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Event & Details</th>
                  <th>Event Date</th>
                  <th>Attendees</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="fw-bold text-primary">#{ord.id.substring(ord.id.length - 4).toUpperCase()}</td>
                    <td>
                      <div className="fw-semibold text-dark mb-1">{ord.eventName}</div>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <IconifyIcon icon="lucide:map-pin" width="14" /> {ord.venue}
                      </div>
                    </td>
                    <td className="text-nowrap">{ord.eventDate}</td>
                    <td>{ord.attendeesCount} Person(s)</td>
                    <td className="fw-bold text-dark">{ord.totalPrice}</td>
                    <td>
                      <span className={`badge ${ord.status === 'Completed' || ord.status === 'Free' ? 'bg-success text-success border-success' : 'bg-warning text-warning border-warning'} bg-opacity-10 border border-opacity-25 px-2.5 py-1.5 rounded-pill`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 text-nowrap"
                          onClick={() => setSelectedTicket(ord)}
                        >
                          <IconifyIcon icon="lucide:qr-code" width="14" /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED BOOKING MODAL */}
      <Modal show={!!selectedTicket} onHide={() => setSelectedTicket(null)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold text-dark fs-5">
            Booking ID - {selectedTicket?.id.substring(selectedTicket?.id.length - 4).toUpperCase()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {/* Billing Info Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
              <h6 className="mb-0 fw-bold text-secondary">Billing Information</h6>
              <span className={`badge ${selectedTicket?.status === 'Completed' || selectedTicket?.status === 'Free' ? 'bg-primary text-primary' : 'bg-warning text-warning'} bg-opacity-10 px-3 py-1 rounded-pill`}>
                {selectedTicket?.status === 'Completed' ? 'Confirmed' : selectedTicket?.status || 'Pending'}
              </span>
              {/* <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 border-danger text-danger bg-white">
                <IconifyIcon icon="lucide:mail" width="14" /> Resend Invoice
              </button> */}
            </div>
            <div className="fw-bold fs-5 text-dark">
              {selectedTicket?.totalPrice}
            </div>
          </div>

          {/* User & Payment Details Grid */}
          <div className="row g-4 mb-4 pb-4 border-bottom">
            <div className="col-md-4">
              <div className="text-dark fw-bold mb-1">Name</div>
              <div className="text-muted small">
                {selectedTicket?.rawBooking?.billingInfo?.firstName} {selectedTicket?.rawBooking?.billingInfo?.lastName || ""}
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-dark fw-bold mb-1">Email</div>
              <div className="text-muted small">{selectedTicket?.rawBooking?.billingInfo?.email || "-"}</div>
            </div>
            <div className="col-md-4">
              <div className="text-dark fw-bold mb-1">Phone</div>
              <div className="text-muted small">{selectedTicket?.rawBooking?.billingInfo?.phone || "-"}</div>
            </div>
            <div className="col-md-4 mt-4">
              <div className="text-dark fw-bold mb-1">Payment Gateway</div>
              <div className="text-muted small">{selectedTicket?.rawBooking?.paymentMethod || "Manual"}</div>
            </div>
            <div className="col-md-4 mt-4">
              <div className="text-dark fw-bold mb-1">Received On</div>
              <div className="text-muted small">
                {selectedTicket?.rawBooking?.createdAt ? dayjs(selectedTicket.rawBooking.createdAt).format('MMMM DD, YYYY hh:mm A') : "-"}
              </div>
            </div>
          </div>

          {/* Event Section */}
          <div className="mb-4">
            <div className="text-dark fw-bold mb-1">Event</div>
            <div className="text-muted small">{selectedTicket?.eventName}</div>
          </div>

          {/* Attendee List */}
          <div className="mb-2">
            <h6 className="fw-bold text-secondary mb-3">Attendee List</h6>
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="fw-semibold border-0 rounded-start">No.</th>
                    <th className="fw-semibold border-0">Name</th>
                    <th className="fw-semibold border-0">Ticket</th>
                    <th className="fw-semibold border-0 text-center">QR Code</th>
                    <th className="fw-semibold border-0 text-center rounded-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTicket?.rawBooking?.tickets?.flatMap((t: any, tIndex: number) => 
                    (t.attendees || [{ _id: 'dummy', name: 'Attendee' }]).map((a: any, aIndex: number) => {
                      const rowNo = `${selectedTicket.id.substring(selectedTicket.id.length - 4).toUpperCase()}${tIndex + 1}${aIndex + 1}`;
                      return (
                        <tr key={a._id || rowNo}>
                          <td className="text-muted small">{rowNo}</td>
                          <td className="text-muted small">{a.name}</td>
                          <td className="text-muted small">{t.ticketName}</td>
                          <td className="text-center">
                            <Image
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(
                                `${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')}/admin/attendees/scanner?eventId=${typeof selectedTicket?.rawBooking?.eventId === 'string' ? selectedTicket.rawBooking.eventId : (selectedTicket?.rawBooking?.eventId?._id || selectedTicket?.rawBooking?.eventId?.id || '')}&attendeeId=${a._id || a.id || ''}&ticketId=${typeof t.ticketId === 'string' ? t.ticketId : (t.ticketId?._id || t.ticketId?.id || '')}`
                              )}`}
                              alt="QR Code"
                              width="64"
                              height="64"
                              className="border rounded p-1 shadow-sm"
                            />
                          </td>
                          <td className="text-center">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id={`tooltip-ticket-${a._id || a.id}`}>View Ticket PDF</Tooltip>}
                            >
                              <button
                                className="btn btn-sm btn-light text-primary border rounded"
                                onClick={() => handleDownloadTicket(selectedTicket.id, a._id, a, selectedTicket.rawBooking.eventId, t)}
                                disabled={isDownloading === a._id}
                              >
                                {isDownloading === a._id ? (
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                  <IconifyIcon icon="lucide:eye" width="16" />
                                )}
                              </button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Hidden Ticket Template for PDF Generation */}
      {printAttendeeData && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div id={`profile-ticket-template-${printAttendeeData.attendee._id || printAttendeeData.attendee.id}`}>
            <TicketTemplate 
              attendee={printAttendeeData.attendee} 
              eventDetails={printAttendeeData.eventDetails} 
              user={user} 
              bookingId={printAttendeeData.bookingId} 
              pdfMode={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
