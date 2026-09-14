"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchEvents } from "@/redux/slices/admin/eventSlice";
import { fetchTickets } from "@/redux/slices/admin/ticketSlice";
import { fetchUsers } from "@/redux/slices/admin/userSlice";
import { fetchBookings } from "@/redux/slices/admin/bookingSlice";
import { createAttendee, fetchAttendeeById, updateAttendee } from "@/redux/slices/admin/attendeeSlice";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";

const Select = dynamic(() => import("react-select"), { ssr: false });

interface AttendeeModalProps {
  show: boolean;
  onHide: () => void;
  id?: string | null;
  onSuccess: () => void;
}

const AttendeeModal: React.FC<AttendeeModalProps> = ({ show, onHide, id, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isEdit = !!id;

  const { events } = useAppSelector((state) => state.events);
  const { tickets } = useAppSelector((state) => state.tickets);
  const { users } = useAppSelector((state) => state.users);
  const { bookings } = useAppSelector((state) => state.bookings);

  const [formData, setFormData] = useState({
    eventId: null as string | null,
    bookingPerson: null as string | null,
    name: "",
    ticketId: null as string | null,
    ticketPrice: "",
    ticketStatus: null as string | null,
    paymentStatus: null as string | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      dispatch(fetchEvents({ limit: 1000 }));
      dispatch(fetchUsers() as any);
      dispatch(fetchBookings() as any);
      
      if (isEdit && id) {
        setIsLoading(true);
        dispatch(fetchAttendeeById(id))
          .unwrap()
          .then((attendee) => {
            const evId = attendee.eventId?._id || attendee.eventId;
            const bookingUser = attendee.bookingId?.userId;
            const bUserId = bookingUser?._id || bookingUser?.id || bookingUser || null;
            
            setFormData({
              eventId: evId,
              bookingPerson: bUserId,
              name: attendee.name,
              ticketId: attendee.ticketId?._id || attendee.ticketId,
              ticketPrice: attendee.ticketPrice.toString(),
              ticketStatus: attendee.ticketStatus,
              paymentStatus: attendee.paymentStatus,
            });
            
            if (evId) {
              dispatch(fetchTickets(evId));
            }
            setIsLoading(false);
          })
          .catch((err) => {
            Swal.fire("Error", err || "Failed to load attendee details", "error");
            setIsLoading(false);
          });
      } else {
        // Reset form for new attendee
        setFormData({
          eventId: null,
          bookingPerson: null,
          name: "",
          ticketId: null,
          ticketPrice: "",
          ticketStatus: null,
          paymentStatus: null,
        });
      }
    }
  }, [dispatch, id, isEdit, show]);

  useEffect(() => {
    if (formData.eventId && !isEdit && show) {
      dispatch(fetchTickets(formData.eventId));
      setFormData((prev) => ({ ...prev, ticketId: null, ticketPrice: "" }));
    }
  }, [formData.eventId, dispatch, isEdit, show]);

  const activeTickets = useMemo(() => tickets.filter((t: any) => t.isActive !== false), [tickets]);

  const bookingPersonOptions = useMemo(() => {
    const uniqueUsers = new Map();
    
    if (!formData.eventId) return [];

    bookings.forEach((b: any) => {
      const bEventId = b.eventId?._id || b.eventId?.id || b.eventId;
      
      if (bEventId === formData.eventId) {
        const user = b.userId;
        if (user && (user._id || user.id)) {
          const id = user._id || user.id;
          const name = user.name || "Unknown User";
          const group = user.group || "";
          
          if (!name.toLowerCase().includes("admin") && !group.toLowerCase().includes("admin")) {
            if (!uniqueUsers.has(id)) {
              uniqueUsers.set(id, { value: id, label: name });
            }
          }
        }
      }
    });

    return Array.from(uniqueUsers.values());
  }, [bookings, formData.eventId]);

  const handleTicketSelect = (selectedOption: any) => {
    const selectedTicket = tickets.find((t: any) => (t._id || t.id) === selectedOption?.value);
    setFormData((prev) => ({
      ...prev,
      ticketId: selectedOption?.value || null,
      ticketPrice: selectedTicket ? selectedTicket.ticketPrice.toString() : "",
    }));
  };

  const handleSubmit = async () => {
    if (!formData.eventId || !formData.name || !formData.ticketId || !formData.ticketPrice) {
      Swal.fire("Error", "Please fill out all required fields (*)", "error");
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      ticketPrice: Number(formData.ticketPrice),
      ticketStatus: formData.ticketStatus || "Unused",
      paymentStatus: formData.paymentStatus || "Pending",
    };

    try {
      if (isEdit) {
        await dispatch(updateAttendee({ id: id!, payload })).unwrap();
        Swal.fire("Success", "Attendee updated successfully", "success");
      } else {
        await dispatch(createAttendee(payload)).unwrap();
        Swal.fire("Success", "Attendee created successfully", "success");
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      Swal.fire("Error", err || "Failed to save attendee", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ticketStatusOptions = [
    { value: "Unused", label: "Unused" },
    { value: "Used", label: "Used" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Success", label: "Success" },
    { value: "Failed", label: "Failed" },
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {isEdit ? "Edit Attendee" : "Add Attendee"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <p className="text-muted mb-4">
              {isEdit ? "Update" : "Add"} attendee details below.
            </p>

            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-danger">* <span className="text-dark">Select Event</span></Form.Label>
                <Select
                  options={events.map((e: any) => ({ value: e._id || e.id, label: e.title }))}
                  value={events.map((e: any) => ({ value: e._id || e.id, label: e.title })).find(opt => opt.value === formData.eventId) || null}
                  onChange={(selected: any) => setFormData({ ...formData, eventId: selected?.value || null })}
                  placeholder="Select Event"
                  isClearable
                  isDisabled={isEdit}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "4px",
                      borderColor: "#dee2e6",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-danger">* <span className="text-dark">Booked By</span></Form.Label>
                    <Select
                      options={bookingPersonOptions}
                      value={bookingPersonOptions.find((opt: any) => opt.value === formData.bookingPerson) || null}
                      onChange={(selected: any) => setFormData({ ...formData, bookingPerson: selected?.value || null })}
                      placeholder={formData.eventId ? "Select Booking Person" : "Select Event First"}
                      isClearable
                      isDisabled={isEdit || !formData.eventId}
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderColor: "#dee2e6",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-danger">* <span className="text-dark">Name</span></Form.Label>
                    <Form.Control 
                      placeholder="Enter Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ borderColor: "#825ee4" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-muted">Ticket Name</Form.Label>
                    <Select
                      options={activeTickets.map((t: any) => ({ value: t._id || t.id, label: t.ticketName }))}
                      value={activeTickets.map((t: any) => ({ value: t._id || t.id, label: t.ticketName })).find(opt => opt.value === formData.ticketId) || null}
                      onChange={handleTicketSelect}
                      placeholder="Select a Ticket"
                      isClearable
                      isDisabled={isEdit || !formData.eventId}
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderColor: "#dee2e6",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-muted">Ticket Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ticket Price"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      disabled={isEdit}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-muted">Ticket Status</Form.Label>
                    <Select
                      options={ticketStatusOptions}
                      value={ticketStatusOptions.find(opt => opt.value === formData.ticketStatus) || null}
                      onChange={(selected: any) => setFormData({ ...formData, ticketStatus: selected?.value || null })}
                      placeholder="Select Ticket Status"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderColor: "#dee2e6",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-muted">Payment Status</Form.Label>
                    <Select
                      options={paymentStatusOptions}
                      value={paymentStatusOptions.find(opt => opt.value === formData.paymentStatus) || null}
                      onChange={(selected: any) => setFormData({ ...formData, paymentStatus: selected?.value || null })}
                      placeholder="Select Payment Status"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderColor: "#825ee4",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3">
                <Button variant="light" onClick={onHide} style={{ minWidth: '100px' }} className="border">
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1", minWidth: '120px' }}
                >
                  {isSubmitting ? "Processing..." : isEdit ? "Update Attendee" : "Add Attendee"}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AttendeeModal;
