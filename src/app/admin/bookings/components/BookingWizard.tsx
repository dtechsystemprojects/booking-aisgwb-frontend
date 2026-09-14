"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Alert,
  Modal
} from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchEvents } from "@/redux/slices/admin/eventSlice";
import { fetchUsers } from "@/redux/slices/admin/userSlice";
import { fetchGroups } from "@/redux/slices/admin/groupSlice";
import { fetchTickets } from "@/redux/slices/admin/ticketSlice";
import { createBooking, fetchBookingById, updateBooking, fetchEventAttendees, fetchUserMembership } from "@/redux/slices/admin/bookingSlice";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import Swal from "sweetalert2";
import Icon from "@/components/wrappers/Icon";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceTemplate } from "@/app/(frontEnd)/profile/components/InvoiceTemplate";
import { TicketTemplate } from "@/app/(frontEnd)/profile/components/TicketTemplate";
import { useSettingsContext } from "@/context/useSettingsContext";

const BookingWizard = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { events } = useAppSelector((state) => state.events);
  const { tickets } = useAppSelector((state) => state.tickets);
  const { users } = useAppSelector((state) => state.users);
  const { groups } = useAppSelector((state) => state.groups);
  
  const { setting } = useSettingsContext();
  const underAgeLimit = parseInt(setting('general.under_age', '10')) || 10;
  

  const [step, setStep] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState("Online");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [ticketSelections, setTicketSelections] = useState<{ [key: string]: number }>({});
  const [userMembership, setUserMembership] = useState<any>(null);
  
  const [billingInfo, setBillingInfo] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  // attendees structure: { [ticketId]: [ { name: "" }, { name: "" } ] }
  const [attendees, setAttendees] = useState<{ [key: string]: {
    [x: string]: any; name: string 
}[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [downloadingTxn, setDownloadingTxn] = useState<any>(null);
  const [downloadingTickets, setDownloadingTickets] = useState<any[]>([]);

  const [eventAttendees, setEventAttendees] = useState<any[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId || (u as any)._id === selectedUserId), [users, selectedUserId]);

  const activeTickets = useMemo(() => {
    return tickets.filter((t: any) => t.isActive !== false);
  }, [tickets]);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isEdit = !!id;
  const [mounted, setMounted] = useState(false);

  const filteredUsers = useMemo(() => {
    const userGroup = groups.find(g => g.name.toLowerCase() === 'user');
    return userGroup ? users.filter(u => u.groupId === userGroup.id) : users;
  }, [groups, users]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(fetchEvents({ limit: 1000 }));
    dispatch(fetchUsers());
    dispatch(fetchGroups());
    if (id) {
      setIsFetching(true);
      dispatch(fetchBookingById(id))
        .unwrap()
        .then((booking) => {
          setSelectedEventId(booking.eventId?._id || booking.eventId);
          setSelectedUserId(booking.userId?._id || booking.userId || null);
          
          setBillingInfo({
            firstName: booking.billingInfo?.firstName || "",
            lastName: booking.billingInfo?.lastName || "",
            email: booking.billingInfo?.email || "",
            phone: booking.billingInfo?.phone || ""
          });

          const initSelections: { [key: string]: number } = {};
          const initAttendees: { [key: string]: { name: string }[] } = {};
          
          booking.tickets?.forEach((t: any) => {
            const tId = t.ticketId?._id || t.ticketId;
            initSelections[tId] = t.quantity;
            initAttendees[tId] = t.attendees || Array.from({ length: t.quantity }).map(() => ({ name: "", age: "", relation: "" }));
          });
          
          setTicketSelections(initSelections);
          setAttendees(initAttendees);
          
          // Pre-fetch tickets for the event
          dispatch(fetchTickets(booking.eventId?._id || booking.eventId));
          setIsFetching(false);
        })
        .catch((err) => {
          Swal.fire("Error", err || "Failed to load booking", "error");
          setIsFetching(false);
        });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedEventId && !isEdit) {
      dispatch(fetchTickets(selectedEventId));
      setTicketSelections({});
      setAttendees({});
    }
  }, [selectedEventId, dispatch, isEdit]);

  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchEventAttendees(selectedEventId))
        .unwrap()
        .then((data: any) => {
          if (data) {
            const valid = data.filter((a: any) => {
              const aEventId = a.eventId?._id || a.eventId?.id || a.eventId;
              return aEventId === selectedEventId && a.ticketStatus !== 'Cancelled';
            });
            setEventAttendees(valid);
          }
        })
        .catch((err: any) => console.error("Failed to fetch attendees for seat calc", err));
    }
  }, [selectedEventId, dispatch]);

  const selectedEvent = useMemo(() => events.find(e => e._id === selectedEventId || e.id === selectedEventId), [events, selectedEventId]);

  useEffect(() => {
    if (selectedUser && !isFetching) {
      const nameParts = selectedUser.name?.split(" ") || [];
      setBillingInfo({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: selectedUser.email || "",
        phone: selectedUser.mobile || ""
      });
    }
  }, [selectedUser, isFetching]);

  // Fetch live membership status when user is selected
  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchUserMembership(selectedUserId))
        .unwrap()
        .then((json: any) => {
          if (json.success && json.data) {
            if (Array.isArray(json.data)) {
              setUserMembership(json.data[0]);
            } else {
              setUserMembership(json.data);
            }
          } else {
            setUserMembership(null);
          }
        })
        .catch(() => setUserMembership(null));
    } else {
      setUserMembership(null);
    }
  }, [selectedUserId, dispatch]);

  const handleTicketQuantityChange = (ticketId: string, delta: number, maxQty: number) => {
    if (delta > 0) {
      const ticketToAdd = activeTickets.find(t => t.id === ticketId || t._id === ticketId);
      if (ticketToAdd) {
        const ticketGroupId = typeof ticketToAdd.groupId === 'object' && ticketToAdd.groupId !== null
            ? (ticketToAdd.groupId as any)._id
            : ticketToAdd.groupId;
        const memberGroupId = process.env.NEXT_PUBLIC_MEMBER_GROUP_ID;
        const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
        
        const isPrimaryPass = ticketGroupId && ticketGroupId !== accPersonGroupId;

        if (isPrimaryPass) {
            const otherPrimarySelected = activeTickets.find(t => {
                const gId = typeof t.groupId === 'object' && t.groupId !== null
                    ? (t.groupId as any)._id
                    : t.groupId;
                const isOtherPrimary = gId && gId !== accPersonGroupId;
                return isOtherPrimary && (t.id !== ticketId && t._id !== ticketId) && (ticketSelections[t.id ?? t._id ?? ''] || 0) > 0;
            });
            
            if (otherPrimarySelected) {
                Swal.fire({
                    icon: 'error',
                    title: 'Selection Error',
                    text: 'You can only select one type of primary pass at a time.',
                });
                return;
            }
            
            if (process.env.NEXT_PUBLIC_BOOKING_MULTIPLE_TICKET_ADD === 'false') {
              let hasPastPrimaryTicket = false;
              for (const a of eventAttendees) {
                  const aUserId = a.userId?._id || a.userId?.id || a.userId || (a.bookingId && (a.bookingId.userId?._id || a.bookingId.userId));
                  if (aUserId === selectedUserId) {
                      const aTicketId = a.ticketId?._id || a.ticketId?.id || a.ticketId;
                      const relatedTicket = activeTickets.find((t: any) => t._id === aTicketId || t.id === aTicketId);
                      const tGroupId = relatedTicket?.groupId?._id || relatedTicket?.groupId || (a.ticketId?.groupId?._id || a.ticketId?.groupId);
                      if (tGroupId && tGroupId !== accPersonGroupId) {
                          hasPastPrimaryTicket = true;
                          break;
                      }
                  }
              }
              if (hasPastPrimaryTicket) {
                  Swal.fire({
                      icon: 'error',
                      title: 'Attention!',
                      text: 'You have already booked a Primary pass for this event. You can only buy an Accompanying Person ticket.',
                  });
                  return;
              }
            
            const currentQty = ticketSelections[ticketId] || 0;
            if (currentQty + delta > 1) {
                Swal.fire({
                    icon: 'error',
                    title: 'Limit Exceeded',
                    text: 'You can only buy one primary pass per booking.',
                });
                return;
            }
          }
            const isApprovedMember = userMembership?.status === 'Approved';
            
            if (isApprovedMember) {
                if (ticketGroupId !== memberGroupId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Attention!',
                        text: 'Approved members cannot buy Non-Member or Residents tickets.',
                    });
                    return;
                }
            } else {
                if (ticketGroupId === memberGroupId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Attention!',
                        text: `Not approved members can only buy Residents or Non-Member tickets (with Accompanying Person tickets). User's membership status is: ${userMembership?.status || 'Not Found'}.`,
                    });
                    return;
                }
            }
        }
      }
    }

    setTicketSelections(prev => {
      const current = prev[ticketId] || 0;
      const newQty = current + delta;
      if (newQty < 0) return prev;
      if (newQty > maxQty) return prev; // Optionally show alert
      
      return { ...prev, [ticketId]: newQty };
    });
  };

  const handleNextStep1 = () => {
    if (!selectedEventId || !selectedUserId) {
      Swal.fire("Error", "Please select both an event and a user first", "error");
      return;
    }
    
    const totalSelected = Object.values(ticketSelections).reduce((a, b) => a + b, 0);
    if (totalSelected === 0) {
      Swal.fire("Error", "Please select at least one ticket", "error");
      return;
    }
    
    // Validation on selected tickets before proceeding
    const selectedTicketObjects = activeTickets.filter(t => (ticketSelections[t.id ?? t._id ?? ''] || 0) > 0);
    
    let primaryPassCount = 0;
    let accPersonCount = 0;
    const memberGroupId = process.env.NEXT_PUBLIC_MEMBER_GROUP_ID;
    const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
    const isApprovedMember = userMembership?.status === 'Approved';

    for (const t of selectedTicketObjects) {
        const ticketGroupId = typeof t.groupId === 'object' && t.groupId !== null
            ? t.groupId._id
            : t.groupId;
            
        if (ticketGroupId === accPersonGroupId) {
            accPersonCount++;
        }
        
        const isPrimaryPass = ticketGroupId && ticketGroupId !== accPersonGroupId;
        if (isPrimaryPass) {
            primaryPassCount++;
            
            if (isApprovedMember) {
                if (ticketGroupId !== memberGroupId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Not Allowed',
                        text: 'Approved members cannot buy Non-Member or Residents tickets.',
                    });
                    return;
                }
            } else {
                if (ticketGroupId === memberGroupId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: `Not approved members can only buy Residents or Non-Member tickets (with Accompanying Person tickets). User's membership status is: ${userMembership?.status || 'Not Found'}.`,
                    });
                    return;
                }
            }
        }
    }

    if (primaryPassCount > 1) {
        Swal.fire({
            icon: 'error',
            title: 'Selection Error',
            text: 'You can only select one type of primary pass at a time.',
        });
        return;
    }
    
    let hasPastPrimaryTicket = false;
    for (const a of eventAttendees) {
        const aUserId = a.userId?._id || a.userId?.id || a.userId || (a.bookingId && (a.bookingId.userId?._id || a.bookingId.userId));
        if (aUserId === selectedUserId) {
            const aTicketId = a.ticketId?._id || a.ticketId?.id || a.ticketId;
            const relatedTicket = activeTickets.find((t: any) => t._id === aTicketId || t.id === aTicketId);
            const ticketGroupId = relatedTicket?.groupId?._id || relatedTicket?.groupId || (a.ticketId?.groupId?._id || a.ticketId?.groupId);
            if (ticketGroupId && ticketGroupId !== accPersonGroupId) {
                hasPastPrimaryTicket = true;
                break;
            }
        }
    }

    if (accPersonCount > 0 && primaryPassCount === 0) {
        if (!hasPastPrimaryTicket) {
            Swal.fire({
                icon: 'error',
                title: 'Attention!',
                text: 'You must select at least one Primary pass (e.g. Member Pass) to buy an Accompanying Person ticket.',
            });
            return;
        }
    }
    
    // Initialize attendees array for Step 2 based on quantity
    const newAttendees: any = { ...attendees };
    Object.keys(ticketSelections).forEach(ticketId => {
      const qty = ticketSelections[ticketId];
      if (!newAttendees[ticketId]) {
        newAttendees[ticketId] = Array.from({ length: qty }).map(() => ({ name: "", age: "", relation: "" }));
      } else if (newAttendees[ticketId].length !== qty) {
        const existing = newAttendees[ticketId];
        const updated = Array.from({ length: qty }).map((_, i) => existing[i] || { name: "", age: "", relation: "" });
        newAttendees[ticketId] = updated;
      }
    });
    setAttendees(newAttendees);
    
    setStep(2);
  };

  const handleAttendeeChange = (ticketId: string, index: number, field: string, value: string) => {
    setAttendees(prev => {
      const updated = [...prev[ticketId]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [ticketId]: updated };
    });
  };

  const calculateSubtotal = (ticketId: string) => {
    const qty = ticketSelections[ticketId] || 0;
    const ticket = tickets.find(t => t._id === ticketId);
    if (!ticket) return 0;
    
    const ticketGroupId = typeof ticket?.groupId === 'object' && ticket?.groupId !== null
        ? (ticket?.groupId as any)._id
        : ticket?.groupId;
    const isAccompanyingPerson = ticketGroupId === process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;

    let total = 0;
    for (let i = 0; i < qty; i++) {
        const attendee = attendees[ticketId]?.[i];
        if (isAccompanyingPerson && attendee && attendee.age) {
            const ageNum = parseInt(attendee.age);
            if (!isNaN(ageNum) && ageNum < underAgeLimit) {
                continue;
            }
        }
        total += ticket.ticketPrice || 0;
    }
    return total;
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(ticketSelections).forEach(id => {
      total += calculateSubtotal(id);
    });
    return total;
  };

  const openPaymentModal = () => {
    if (!selectedUserId) {
      Swal.fire("Error", "Please select a user", "error");
      return;
    }

    // Validate all attendee names, and age/relation if accompanying person
    let allValid = true;
    const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
    
    Object.keys(ticketSelections).forEach(ticketId => {
      if (ticketSelections[ticketId] > 0) {
        const ticket = activeTickets.find(t => t.id === ticketId || t._id === ticketId);
        const ticketGroupId = typeof ticket?.groupId === 'object' && ticket?.groupId !== null
            ? (ticket?.groupId as any)._id
            : ticket?.groupId;
            
        attendees[ticketId]?.forEach(att => {
          if (!att.name || !att.name.trim()) allValid = false;
          if (ticketGroupId === accPersonGroupId) {
              if (!att.age || !att.age.toString().trim()) allValid = false;
              if (!att.relation || !att.relation.trim()) allValid = false;
          }
        });
      }
    });

    if (!allValid) {
      Swal.fire("Error", "Please provide required details (Name, and Age/Relation for accompanying persons) for all attendees", "error");
      return;
    }

    if (calculateTotal() === 0) {
      handleSubmit();
      return;
    }

    setShowPaymentModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowPaymentModal(false);

    const payloadTickets = Object.keys(ticketSelections)
      .filter(id => ticketSelections[id] > 0)
      .flatMap(id => {
        const ticket = tickets.find(t => t._id === id);
        if (!ticket) return [];
        
        const ticketGroupId = typeof ticket?.groupId === 'object' && ticket?.groupId !== null
            ? (ticket?.groupId as any)._id
            : ticket?.groupId;
        const isAccompanyingPerson = ticketGroupId === process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
        
        const regularAttendees: any[] = [];
        const underAgeAttendees: any[] = [];
        
        const attList = attendees[id] || [];
        for (let i = 0; i < ticketSelections[id]; i++) {
            const attendee = attList[i];
            if (isAccompanyingPerson && attendee && attendee.age) {
                const ageNum = parseInt(attendee.age);
                if (!isNaN(ageNum) && ageNum < underAgeLimit) {
                    underAgeAttendees.push(attendee);
                    continue;
                }
            }
            regularAttendees.push(attendee);
        }
        
        const results = [];
        if (regularAttendees.length > 0) {
            results.push({
                ticketId: id,
                ticketName: ticket?.ticketName,
                price: ticket?.ticketPrice || 0,
                quantity: regularAttendees.length,
                attendees: regularAttendees
            });
        }
        if (underAgeAttendees.length > 0) {
            results.push({
                ticketId: id,
                ticketName: `For ${ticket?.ticketName} (Under ${underAgeLimit})`,
                price: 0,
                quantity: underAgeAttendees.length,
                attendees: underAgeAttendees
            });
        }
        return results;
      });

    const finalTransactionRef = transactionNumber.trim() ? transactionNumber : `REF-${Date.now()}`;
    const totalAmount = calculateTotal();

    const payload = {
      eventId: selectedEventId,
      userId: selectedUserId,
      billingInfo: {
        firstName: billingInfo.firstName || "Unknown",
        lastName: billingInfo.lastName,
        email: billingInfo.email,
        phone: billingInfo.phone
      },
      tickets: payloadTickets,
      paymentMethod: paymentMode,
      transactionRef: finalTransactionRef,
      totalAmount: totalAmount,
      paymentStatus: totalAmount === 0 ? "Completed" : "Completed",
      bookingStatus: "Confirmed",
      transactionData: {
        description: `Admin Booking for ${selectedEvent?.title || 'Event'}`,
        paymentMethod: paymentMode,
        amount: totalAmount,
        userId: selectedUserId,
        eventId: selectedEventId,
        transactionRef: finalTransactionRef,
        status: "Success"
      }
    };

    try {
      if (isEdit) {
        await dispatch(updateBooking({ id: id!, payload })).unwrap();
        Swal.fire("Success", "Booking updated successfully!", "success").then(() => {
          router.push("/admin/bookings");
        });
      } else {
        const newBooking = await dispatch(createBooking(payload)).unwrap();
        
        // Prepare provisional transaction for InvoiceTemplate
        const provisionalTxn = {
          id: newBooking._id || newBooking.id || "pending",
          transactionRef: finalTransactionRef,
          date: dayjs().format('DD MMMM YYYY, hh:mm A'),
          description: payload.transactionData.description,
          paymentMethod: payload.paymentMethod,
          amount: `₹ ${totalAmount}`,
          status: payload.paymentStatus,
          type: "Event Ticket",
          eventName: selectedEvent?.title,
          tickets: payloadTickets.map(t => ({
            name: t.ticketName || "Event Ticket",
            quantity: t.quantity,
            unitPrice: `₹ ${Number(t.price).toFixed(2)}`,
            totalPrice: `₹ ${Number(t.price * t.quantity).toFixed(2)}`
          })),
          quantity: payloadTickets.reduce((sum, t) => sum + t.quantity, 0),
          unitPrice: `₹ ${totalAmount}`,
        };
        
        setDownloadingTxn(provisionalTxn);

        // Fetch attendees for this booking to get all attendees
        let bookingAtts: any[] = [];
        try {
          const allAttendees = await dispatch(fetchEventAttendees()).unwrap();
          const bId = newBooking._id || newBooking.id;
          bookingAtts = allAttendees.filter((a: any) => {
            const abId = a.bookingId?._id || a.bookingId?.id || a.bookingId;
            return abId === bId;
          }).map((a: any) => {
            const match = payloadTickets.find(pt => pt.attendees.some((pa: any) => pa.name === a.name));
            if (match) {
              return { ...a, ticketName: match.ticketName, ticketPrice: match.price };
            }
            return a;
          });
          setDownloadingTickets(bookingAtts);
        } catch (err) {
          console.error("Failed to fetch attendees for ticket generation", err);
        }

        setTimeout(async () => {
          const element = document.getElementById("admin-invoice-template-container");
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
          
          if (element && provisionalTxn.id !== "pending") {
            try {
              const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF("p", "mm", "a4");
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
              const pdfBase64 = pdf.output('datauristring');
              
              await fetch(`${API_URL}/admin/bookings/${provisionalTxn.id}/resend-invoice`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ pdfBase64 })
              });
            } catch (err) {
              console.error("Failed to generate/upload admin invoice PDF", err);
            }
          }
          
          // Generate and send tickets for attendees
          for (const att of bookingAtts) {
            const attId = att._id || att.id;
            const ticketEl = document.getElementById(`admin-ticket-template-${attId}`);
            if (ticketEl) {
              try {
                const canvas = await html2canvas(ticketEl, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                const pdfBase64 = pdf.output('datauristring');
                
                await fetch(`${API_URL}/admin/attendees/${attId}/resend-ticket`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({ ticketPdfBase64: pdfBase64 })
                });
              } catch (err) {
                console.error(`Failed to generate/upload ticket PDF for attendee ${attId}`, err);
              }
            }
          }
          
          Swal.fire("Success", "Booking created successfully!", "success").then(() => {
            router.push("/admin/bookings");
          });
        }, 2000);
      }
    } catch (err: any) {
      Swal.fire("Error", err || `Failed to ${isEdit ? "update" : "create"} booking`, "error");
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading booking details...</p>
        </CardBody>
      </Card>
    );
  }

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-4">
          <p className="text-muted mb-4">
            {isEdit ? "Update booking details below." : "Add booking details below to create a new booking quickly and easily."}
          </p>

          {step === 1 && (
            <div className="mb-4">
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label>Select Event</Form.Label>
                    <Select
                      options={events
                        .filter((e: any) => {
                          if (e.status !== 'Upcoming') return false;
                          if (!e.registrationOpen) return false;
                          return new Date(e.registrationOpen) <= new Date();
                        })
                        .map((e: any) => ({ value: e._id || e.id, label: e.title }))}
                      value={events.map((e: any) => ({ value: e._id || e.id, label: e.title })).find(opt => opt.value === selectedEventId) || null}
                      onChange={(selected: any) => setSelectedEventId(selected?.value || null)}
                      placeholder="Select Event"
                      isClearable
                      isDisabled={isEdit}
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderColor: "#dee2e6",
                          backgroundColor: isEdit ? "#f8f9fa" : base.backgroundColor
                        })
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Select User</Form.Label>
                    <Select
                      options={filteredUsers.map((u: any) => ({ value: u.id || u._id, label: `${u.name} (${u.email})` }))}
                      value={users.map((u: any) => ({ value: u.id || u._id, label: `${u.name} (${u.email})` })).find(opt => opt.value === selectedUserId) || null}
                      onChange={(selected: any) => setSelectedUserId(selected?.value || null)}
                      placeholder="Select User"
                      isClearable
                      isDisabled={isEdit}
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderColor: "#dee2e6",
                          backgroundColor: isEdit ? "#f8f9fa" : base.backgroundColor
                        })
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {(selectedEventId && selectedUserId) && (
                <div className="mt-4">
                  {activeTickets.length === 0 ? (
                    <Alert variant="warning">No active tickets found for this event.</Alert>
                  ) : (
                    <div className="ticket-list">
                      {activeTickets.map(ticket => {
                        const bookedCount = eventAttendees.filter(a => {
                          const aTicketId = a.ticketId?._id || a.ticketId?.id || a.ticketId;
                          const isUnderAge = a.ticketName && typeof a.ticketName === 'string' && a.ticketName.includes('(Under');
                          return (aTicketId === ticket._id || aTicketId === ticket.id) && a.ticketStatus !== 'Cancelled' && !isUnderAge;
                        }).length;
                        const remaining = Math.max(0, (ticket.numberOfTickets || 0) - bookedCount);
                        
                        const isExpired = ticket.endDate ? dayjs(ticket.endDate).endOf('day').isBefore(dayjs()) : false;
                        const isSoldOut = remaining <= 0;
                        const isDisabled = isExpired || isSoldOut;
                        
                        let statusMessage = "";
                        if (isExpired) statusMessage = "Sales Closed";
                        else if (isSoldOut) statusMessage = "Sold Out";

                        return (
                        <Card key={ticket._id} className={`mb-4 border-0 shadow-sm ${isDisabled ? 'bg-light opacity-50' : 'bg-light'}`}>
                          <CardBody className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="fw-bold m-0 fs-16 text-dark">
                                  {ticket.ticketName} <span className="text-muted fw-normal fs-14">({remaining} seats remaining)</span>
                                </h6>
                                {ticket.endDate && (
                                  <div className={`small mt-1 ${isExpired ? 'text-danger fw-bold' : 'text-muted'}`}>
                                    {isExpired ? 'Sale Ended on' : 'Sale will end on'} {dayjs(ticket.endDate).format('MMM D, YYYY')}
                                  </div>
                                )}
                              </div>
                              {statusMessage && (
                                <span className="badge bg-danger">{statusMessage}</span>
                              )}
                            </div>
                            <hr className="mb-4" style={{ borderTop: "1px dashed #ced4da", opacity: 1 }} />
                            <Row className="align-items-center">
                              <Col md={4} className="mb-3 mb-md-0">
                                <div className="text-muted small mb-2">Ticket Price:</div>
                                <div className="fw-bold fs-15">₹{(ticket.ticketPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                              </Col>
                              <Col md={4} className="d-flex justify-content-center mb-3 mb-md-0">
                                <div>
                                  <div className="text-muted small mb-2 text-center">Quantity</div>
                                  <InputGroup style={{ width: "130px" }}>
                                    <Button 
                                      variant="outline-secondary" 
                                      className="bg-white"
                                      onClick={() => handleTicketQuantityChange(ticket._id as string, -1, ticket.maxQuantity || 10)}
                                      disabled={isDisabled || (ticketSelections[ticket._id as string] || 0) <= 0}
                                    >-</Button>
                                    <Form.Control 
                                      className="text-center bg-white" 
                                      readOnly 
                                      value={ticketSelections[ticket._id as string] || 0} 
                                      disabled={isDisabled}
                                    />
                                    <Button 
                                      variant="outline-secondary" 
                                      className="bg-white"
                                      onClick={() => handleTicketQuantityChange(ticket._id as string, 1, Math.min(ticket.maxQuantity || 10, remaining))}
                                      disabled={isDisabled || (ticketSelections[ticket._id as string] || 0) >= Math.min(ticket.maxQuantity || 10, remaining)}
                                    >+</Button>
                                  </InputGroup>
                                </div>
                              </Col>
                              <Col md={4} className="text-md-end text-center mt-3 mt-md-0">
                                <div className="text-muted small mb-2">Subtotal:</div>
                                <div className="fw-bold fs-15">₹{calculateSubtotal(ticket._id as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                        );
                      })}
                    </div>
                  )}

                  {activeTickets.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-4 border-top pt-3">
                      <h5 className="fw-bold text-dark m-0">
                        Total Quantity: {Object.values(ticketSelections).reduce((a, b) => a + b, 0)}
                      </h5>
                      <h5 className="fw-bold text-dark m-0">
                        Total Price: ₹{Object.keys(ticketSelections).reduce((acc, ticketId) => acc + calculateSubtotal(ticketId), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h5>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 border-top pt-4 mt-4">
                <Button variant="light" onClick={() => router.push("/admin/bookings")}>Back</Button>
                <Button variant="primary" onClick={handleNextStep1} disabled={!selectedEventId}>Save & Next</Button>
              </div>
            </div>
          )}



          {step === 2 && (
            <div>
              <Row>
                <Col lg={8}>
                  <h6 className="fw-bold mb-3">Billing Information</h6>
                  <Card className="mb-4 border-0 shadow-sm bg-light">
                    <CardBody className="p-4">
                      <Row>
                        <Col md={6} className="mb-3">
                          <div className="text-muted small mb-1">Name</div>
                          <div className="fw-medium">{(billingInfo.firstName || billingInfo.lastName) ? `${billingInfo.firstName} ${billingInfo.lastName}` : "N/A"}</div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="text-muted small mb-1">Email</div>
                          <div className="fw-medium">{billingInfo.email || "N/A"}</div>
                        </Col>
                        <Col md={6}>
                          <div className="text-muted small mb-1">Phone</div>
                          <div className="fw-medium">{billingInfo.phone || "N/A"}</div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>

                  <h6 className="fw-bold mb-3">Attendee Details</h6>
                  {Object.keys(ticketSelections).map(ticketId => {
                    const qty = ticketSelections[ticketId];
                    if (qty <= 0) return null;
                    const ticket = tickets.find(t => t._id === ticketId);
                    
                    const ticketGroupId = typeof ticket?.groupId === 'object' && ticket?.groupId !== null
                        ? (ticket?.groupId as any)._id
                        : ticket?.groupId;
                    const isAccompanyingPerson = ticketGroupId === process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;

                    return Array.from({ length: qty }).map((_, idx) => (
                      <div key={`${ticketId}-${idx}`} className="mb-4 p-3 border rounded">
                        <Form.Label className="fw-medium text-dark mb-3">
                          Attendee {idx + 1} ({ticket?.ticketName})
                        </Form.Label>
                        <Row>
                          <Col md={isAccompanyingPerson ? 6 : 12} className="mb-3">
                            <Form.Label className="text-danger small">* <span className="text-dark">Name</span></Form.Label>
                            <Form.Control 
                              placeholder="Enter Name" 
                              value={attendees[ticketId]?.[idx]?.name || ""}
                              onChange={e => handleAttendeeChange(ticketId, idx, 'name', e.target.value)}
                            />
                          </Col>
                          
                          {isAccompanyingPerson && (
                              <>
                                  <Col md={2} className="mb-3">
                                      <Form.Label className="text-danger small">* <span className="text-dark">Age</span></Form.Label>
                                      <Form.Control 
                                        type="number"
                                        min="1"
                                        placeholder="Age" 
                                        value={attendees[ticketId]?.[idx]?.age || ""}
                                        onChange={e => handleAttendeeChange(ticketId, idx, 'age', e.target.value)}
                                      />
                                  </Col>
                                  <Col md={4} className="mb-3">
                                      <Form.Label className="text-danger small">* <span className="text-dark">Relation</span></Form.Label>
                                      <Form.Control 
                                        placeholder="e.g. Spouse, Child" 
                                        value={attendees[ticketId]?.[idx]?.relation || ""}
                                        onChange={e => handleAttendeeChange(ticketId, idx, 'relation', e.target.value)}
                                      />
                                  </Col>
                              </>
                          )}
                        </Row>
                      </div>
                    ));
                  })}
                </Col>
                
                <Col lg={4}>
                  <Card className="border-0 bg-light h-100">
                    <CardBody className="p-4">
                      <h5 className="fw-bold mb-4">{selectedEvent?.title}</h5>
                      
                      <div className="d-flex align-items-center mb-2 text-muted small">
                        <Icon icon="calendar" className="fs-14 me-2 flex-shrink-0" />
                        <span>
                          {selectedEvent?.startDate ? dayjs(selectedEvent.startDate).format("MMMM D, YYYY") : "TBA"}
                          {selectedEvent?.startTime ? ` at ${selectedEvent.startTime}` : ""}
                        </span>
                      </div>
                      <div className="d-flex align-items-start mb-4 text-muted small">
                        <Icon 
                          icon={selectedEvent?.eventType === 'Online' ? "video" : "map-pin"} 
                          className="fs-14 me-2 flex-shrink-0 mt-1" 
                        />
                        <span style={{ wordBreak: 'break-all' }}>
                          {selectedEvent?.eventType === 'Online' 
                            ? (selectedEvent.onlinePlatformUrl || "") 
                            : (selectedEvent?.venueLocation || "")}
                        </span>
                      </div>

                      <hr className="my-4" style={{ borderColor: "#dee2e6" }} />

                      <h6 className="fw-bold mb-3">Booking Summary</h6>
                      
                      {Object.keys(ticketSelections).flatMap(ticketId => {
                        const qty = ticketSelections[ticketId];
                        if (qty <= 0) return [];
                        const ticket = tickets.find(t => t._id === ticketId);
                        
                        const ticketGroupId = typeof ticket?.groupId === 'object' && ticket?.groupId !== null
                            ? (ticket?.groupId as any)._id
                            : ticket?.groupId;
                        const isAccompanyingPerson = ticketGroupId === process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
                        
                        let regularQty = 0;
                        let underAgeQty = 0;
                        
                        const attList = attendees[ticketId] || [];
                        for (let i = 0; i < qty; i++) {
                            const attendee = attList[i];
                            if (isAccompanyingPerson && attendee && attendee.age) {
                                const ageNum = parseInt(attendee.age);
                                if (!isNaN(ageNum) && ageNum < underAgeLimit) {
                                    underAgeQty++;
                                    continue;
                                }
                            }
                            regularQty++;
                        }

                        const items = [];
                        if (regularQty > 0) {
                          items.push(
                            <div key={`summary-${ticketId}-regular`} className="mb-3 text-muted small">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{ticket?.ticketName}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>₹{(ticket?.ticketPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} X {regularQty}</span>
                              </div>
                            </div>
                          );
                        }
                        if (underAgeQty > 0) {
                          items.push(
                            <div key={`summary-${ticketId}-underage`} className="mb-3 text-muted small">
                              <div className="d-flex justify-content-between mb-1">
                                <span>For {ticket?.ticketName} (Under {underAgeLimit})</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>₹0.00 X {underAgeQty}</span>
                              </div>
                            </div>
                          );
                        }
                        return items;
                      })}

                      <hr className="my-4" style={{ borderColor: "#dee2e6" }} />
                      
                      <div className="d-flex justify-content-between fw-bold text-dark fs-5">
                        <span>Total</span>
                        <span>₹{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 border-top pt-4 mt-4">
                <Button variant="light" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" onClick={openPaymentModal} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : isEdit ? "Update Booking" : "Complete Booking"}
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Payment Mode</Form.Label>
            <Form.Select 
              value={paymentMode} 
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="UPI">UPI</option>
            </Form.Select>
          </Form.Group>
          {paymentMode !== 'Cash' && (
            <Form.Group className="mb-3">
              <Form.Label>Transaction Number</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter transaction number" 
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={paymentMode !== 'Cash' && !transactionNumber.trim()}
          >
            Confirm & Complete
          </Button>
        </Modal.Footer>
      </Modal>

      {downloadingTxn && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <InvoiceTemplate transaction={downloadingTxn} user={{ name: `${billingInfo.firstName} ${billingInfo.lastName}`.trim() || "", email: billingInfo.email, phone: billingInfo.phone, memberId: selectedUser?.memberId || "" }} id="admin-invoice-template-container" />
        </div>
      )}

      {downloadingTickets.length > 0 && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          {downloadingTickets.map((att: any) => (
            <div key={att._id || att.id} id={`admin-ticket-template-${att._id || att.id}`}>
              <TicketTemplate 
                attendee={{
                  ...att,
                  ticketPrice: att.ticketPrice || 0,
                  paymentStatus: att.paymentStatus || att.bookingId?.paymentStatus || 'Completed',
                  ticketStatus: att.status || att.ticketStatus || 'Unused',
                  ticketId: att.ticketId?._id || att.ticketId?.id || att.ticketId || ''
                }} 
                eventDetails={selectedEvent} 
                user={{ name: `${billingInfo.firstName} ${billingInfo.lastName}`.trim() || "", email: billingInfo.email, phone: billingInfo.phone, memberId: selectedUser?.memberId || "" }} 
                bookingId={att.bookingId?._id || att.bookingId?.id || "N/A"} 
                pdfMode={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingWizard;


