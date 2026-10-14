'use client';

import React, { useState } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { Container, Row, Col, Card } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchFrontendEventById, fetchFrontendEventTickets } from "@/redux/slices/frontEnd/eventSlice";
import { fetchMyMembership } from "@/redux/slices/frontEnd/membershipSlice";
import { fetchFrontendBookings } from "@/redux/slices/frontEnd/bookingSlice";
import { checkAuth } from "@/redux/slices/authSlice";
import { Spinner } from "react-bootstrap";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Swal from "sweetalert2";
import { Icon as IconifyIcon } from "@iconify/react";
dayjs.extend(customParseFormat);



const EventDetailsClient = ({ eventId }: { eventId: string }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { currentEvent: event, loading, error, tickets, ticketsLoading } = useSelector((state: RootState) => state.frontendEvents);
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { myMembership } = useSelector((state: RootState) => state.frontendMembership);
    const { bookings } = useSelector((state: RootState) => state.frontendBooking);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const router = useRouter();    

    React.useEffect(() => {
        dispatch(checkAuth());
        if (eventId) {
            dispatch(fetchFrontendEventById(eventId));
            dispatch(fetchFrontendEventTickets(eventId));
            
            // Check if there is existing checkout data for this event
            const stored = sessionStorage.getItem("checkoutData");
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    if (data.event?.id === eventId || data.event?._id === eventId) {
                        const initialQuantities: Record<string, number> = {};
                        if (data.tickets && Array.isArray(data.tickets)) {
                            data.tickets.forEach((t: any) => {
                                const tId = t.id || t._id;
                                if (tId) initialQuantities[tId] = t.quantity;
                            });
                            setQuantities(initialQuantities);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing checkout data", e);
                }
            }
        }
    }, [dispatch, eventId]);

    // Fetch live membership status from the API whenever the user is known
    React.useEffect(() => {
        const userId = user?._id ?? user?.id;
        if (userId) {
            dispatch(fetchMyMembership(userId));
            dispatch(fetchFrontendBookings());
        }
    }, [dispatch, user?._id, user?.id]);

    const parseDate = (d: string | null | undefined) => {
        if (!d) return null;
        let obj = dayjs(d, ["YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "DD MMM YYYY"], true);
        if (!obj.isValid()) obj = dayjs(d);
        return obj.isValid() ? obj : null;
    };

    const isEventRegistrationOver = () => {
        if (!event) return false;
        const now = dayjs();
        const activeRegClose = event.registrationClose || event.endDate;
        const endObj = parseDate(activeRegClose);
        if (!endObj) return false;

        const activeRegOpen = event.registrationOpen || event.startDate;
        const startObj = parseDate(activeRegOpen);

        // If registration open / start date and current date are the same, registration is active today
        if (startObj && startObj.isSame(now, 'day')) {
            return false;
        }

        // If registration close is today and no end time specified, open through end of day
        if (endObj.isSame(now, 'day') && !event.endTime) {
            return false;
        }

        let finalEnd = endObj.endOf('day');
        if (event.endTime) {
            let timeObj = dayjs(event.endTime, ["HH:mm", "HH:mm:ss", "hh:mm A", "h:mm A", "h:mmA", "hh:mmA"], true);
            if (!timeObj.isValid()) timeObj = dayjs(`1970-01-01T${event.endTime}`);
            if (timeObj.isValid()) {
                finalEnd = endObj.hour(timeObj.hour()).minute(timeObj.minute()).second(timeObj.second());
            }
        }

        return finalEnd.isBefore(now);
    };

    const getTicketDateStatus = (ticket: any) => {
        const now = dayjs();

        // 1. If event-level registration date is over, every ticket is date over
        if (isEventRegistrationOver()) {
            const endObj = parseDate(event?.registrationClose || event?.endDate);
            const formatted = endObj ? endObj.format('MMM DD, YYYY') : null;
            return {
                isDateOver: true,
                isUpcoming: false,
                isSoldOut: false,
                isCartAvailable: false,
                startFormatted: null,
                endFormatted: formatted,
                ticketCloseFormatted: formatted,
                bookingCloseFormatted: formatted || "",
            };
        }

        const activeStartDate = ticket.startDate || event?.registrationOpen || event?.startDate;
        const startObj = parseDate(activeStartDate);

        const activeEndDate = ticket.endDate || event?.registrationClose || event?.endDate || event?.startDate;
        const endObj = parseDate(activeEndDate);
        const activeEndTime = ticket.endTime || event?.endTime;

        let isDateOver = false;
        if (endObj) {
            const isStartSameAsToday = startObj ? startObj.isSame(now, 'day') : false;
            const isEndSameAsToday = endObj.isSame(now, 'day');

            // If start date and current date are the same, it is NOT date over (ticket cart available)
            if (isStartSameAsToday) {
                isDateOver = false;
            } else {
                let finalEnd = endObj.endOf('day');
                if (activeEndTime) {
                    let timeObj = dayjs(activeEndTime, ["HH:mm", "HH:mm:ss", "hh:mm A", "h:mm A", "h:mmA", "hh:mmA"], true);
                    if (!timeObj.isValid()) timeObj = dayjs(`1970-01-01T${activeEndTime}`);
                    if (timeObj.isValid()) {
                        finalEnd = endObj.hour(timeObj.hour()).minute(timeObj.minute()).second(timeObj.second());
                    }
                }

                if (isEndSameAsToday && !activeEndTime) {
                    isDateOver = false;
                } else {
                    isDateOver = finalEnd.isBefore(now);
                }
            }
        }

        let isUpcoming = false;
        if (startObj) {
            // If start date and current date are the same, it is AVAILABLE (not upcoming)
            if (startObj.isSame(now, 'day')) {
                isUpcoming = false;
            } else if (startObj.startOf('day').isAfter(now)) {
                isUpcoming = true;
            }
        }

        const isSoldOut = (ticket.seatsRemaining ?? 1) <= 0;
        const isCartAvailable = !isDateOver && !isUpcoming && !isSoldOut;

        let endFormatted: string | null = null;
        if (endObj) {
            endFormatted = endObj.format('MMM DD, YYYY');
        }

        let startFormatted: string | null = null;
        if (startObj) {
            startFormatted = startObj.format('MMM DD, YYYY');
        }

        // Ticket-specific close date
        const ticketEndObj = parseDate(ticket.endDate) || endObj;
        const ticketCloseFormatted = ticketEndObj ? ticketEndObj.format('MMM DD, YYYY') : endFormatted;

        // Event-wide booking registration close date
        const eventRegCloseObj = parseDate(event?.registrationClose || event?.endDate);
        const bookingCloseFormatted = eventRegCloseObj ? eventRegCloseObj.format('MMM DD, YYYY') : (endFormatted || "");

        return {
            isDateOver,
            isUpcoming,
            isSoldOut,
            isCartAvailable,
            startFormatted,
            endFormatted,
            ticketCloseFormatted,
            bookingCloseFormatted,
        };
    };

    const isTicketDisabled = (ticket: any) => {
        const status = getTicketDateStatus(ticket);
        return !status.isCartAvailable;
    };

    const updateQuantity = (id: string, delta: number) => {
        const ticketToAdd = tickets.find(t => t.id === id || t._id === id);
        
        if (delta > 0 && ticketToAdd) {
            const dateStatus = getTicketDateStatus(ticketToAdd);
            if (!dateStatus.isCartAvailable) {
                if (dateStatus.isUpcoming) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Upcoming Ticket',
                        text: `Sale for this ticket starts on ${dateStatus.startFormatted}.`,
                    });
                    return;
                }
                if (dateStatus.isDateOver) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Attention!',
                        text: 'The booking period for this ticket has ended.',
                    });
                    return;
                }
                if (dateStatus.isSoldOut) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Sold Out',
                        text: 'This ticket is sold out.',
                    });
                    return;
                }
            }

            const ticketGroupId = typeof ticketToAdd.groupId === 'object' && ticketToAdd.groupId !== null
                ? (ticketToAdd.groupId as any)._id
                : ticketToAdd.groupId;
            const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
            
            const isAccPersonByName = (ticketToAdd as any).ticketName?.toLowerCase().includes('accompany') || (ticketToAdd as any).name?.toLowerCase().includes('accompany');
            const isPrimaryPass = (ticketGroupId && ticketGroupId !== accPersonGroupId) && !isAccPersonByName;

            if (isPrimaryPass) {
                const otherPrimarySelected = tickets.find(t => {
                    const gId = typeof t.groupId === 'object' && t.groupId !== null
                        ? (t.groupId as any)._id
                        : t.groupId;
                    const isOtherAccPersonByName = (t as any).ticketName?.toLowerCase().includes('accompany') || (t as any).name?.toLowerCase().includes('accompany');
                    const isOtherPrimary = (gId && gId !== accPersonGroupId) && !isOtherAccPersonByName;
                    return isOtherPrimary && (t.id !== id && t._id !== id) && (quantities[t.id ?? t._id ?? ''] || 0) > 0;
                });
                
                if (otherPrimarySelected) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Attention!',
                        text: 'Please select only one option Member, Non-Member, or Resident at a time for a single member.',
                    });
                    return;
                }
                
                let hasPastPrimaryTicket = false;
                for (const b of bookings || []) {
                    const bEventId = b.eventId?._id || b.eventId?.id || b.eventId;
                    const currentEventId = event?._id || event?.id;
                    if (bEventId === currentEventId) {
                        for (const bt of b.tickets || []) {
                            const bTicketId = bt.ticketId?._id || bt.ticketId?.id || bt.ticketId;
                            const relatedTicket = tickets.find((t: any) => t._id === bTicketId || t.id === bTicketId);
                            const tGroupId = (relatedTicket?.groupId as any)?._id || relatedTicket?.groupId;
                            const isRelAccPerson = (relatedTicket as any)?.ticketName?.toLowerCase().includes('accompany') || (relatedTicket as any)?.name?.toLowerCase().includes('accompany');
                            if ((tGroupId && tGroupId !== accPersonGroupId) && !isRelAccPerson) {
                                hasPastPrimaryTicket = true;
                                break;
                            }
                        }
                    }
                    if (hasPastPrimaryTicket) break;
                }
                
                if (hasPastPrimaryTicket) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Attention!',
                        text: 'You have already booked a Primary pass for this event. You can only buy an Accompanying Person ticket.',
                    });
                    return;
                }
            
                const currentQty = quantities[id] || 0;
                if (currentQty + delta > 1) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Limit Exceeded',
                        text: 'You can only buy one primary pass per booking.',
                    });
                    return;
                }

            }
        }

        setQuantities((prev) => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [id]: next };
        });
    };

    const eventRegClosed = isEventRegistrationOver();
    const regCloseFormatted = parseDate(event?.registrationClose || event?.endDate)?.format('MMM DD, YYYY') || "";
    const visibleTickets = eventRegClosed ? [] : tickets.filter(t => {
        const status = getTicketDateStatus(t);
        return !status.isDateOver && !status.isUpcoming;
    });
    const validTickets = visibleTickets.filter(t => !isTicketDisabled(t));
    const totalQuantity = validTickets.reduce((acc, t) => acc + (quantities[t.id] || 0), 0);
    const totalPrice = validTickets.reduce((acc, t) => {
        return acc + (quantities[t.id] || 0) * t.price;
    }, 0);

    const formatCurrency = (val: number) => {
        return "₹" + val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <>
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ color: "#333" }}>
            <Header />

            <main className="flex-grow-1 eventDetails">
                <Container>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading event details...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-5 text-danger">
                            <h4>Error loading event: {error}</h4>
                        </div>
                    ) : (
                    <Row className="g-4">
                        {/* Left Main Content Area */}
                        <Col lg={8}>
                            {/* Event Main Title */}
                            <h2 className="fw-bold mb-3 text-dark fs-2 lh-sm">
                                {event?.title || "Annual Conference of Indian Society of Gastroenterology, West Bengal Chapter"}
                            </h2>

                            {/* Banner Poster */}
                            {(event?.banner || event?.logo) && (
                                <div className="mb-2 overflow-hidden rounded-2 shadow-sm border">
                                    <Image
                                        src={event?.banner || event?.logo || ""}
                                        alt={event?.title || "Annual Conference Banner"}
                                        className="w-100 h-auto d-block" width={200}
                                        height={200}
                                    />
                                </div>
                            )}

                            {/* Pricing & Deadline Table */}
                            <div className="mb-2">
                                <div className="table-responsive border border rounded-1 bg-white">
                                    {event?.description ? (
                                        <div className="p-3" dangerouslySetInnerHTML={{ __html: event.description }} />
                                    ) : (
                                        <p className="text-muted p-3 mb-0">No description available.</p>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Right Sidebar Area */}
                        <Col lg={4}>
                            <div className="position-sticky" style={{ top: "130px" }}>
                                <Card className="border-0 shadow-sm rounded-3 mb-4 bg-white">
                                    <Card.Body className="py-3 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-bold text-primary">Venue :</span>
                                            <span className="text-secondary">{event?.venueLocation || ""}</span>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm rounded-3 bg-white">
                                    <Card.Body className="p-3">
                                        <h4 className="fw-bold text-dark mb-3 fs-4">Annual Conference Pass</h4>

                                        {eventRegClosed ? (
                                            <div className="text-center py-4 px-2">
                                                <div className="mb-3 text-danger">
                                                    <IconifyIcon icon="lucide:calendar-x" width="48" height="48" />
                                                </div>
                                                <h5 className="fw-bold text-dark mb-2">Registration Closed</h5>
                                                <p className="text-muted small mb-4">
                                                    Online registration for this event closed on {regCloseFormatted}.
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn w-100 py-2 fw-bold text-uppercase"
                                                    style={{
                                                        backgroundColor: "#d0d5dd",
                                                        borderColor: "#d0d5dd",
                                                        color: "#667085",
                                                        cursor: "not-allowed",
                                                        borderRadius: "6px"
                                                    }}
                                                    disabled
                                                >
                                                    Registration Closed
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {isAuthenticated && (
                                                    <>
                                                        {ticketsLoading && (
                                                            <div className="text-center py-3">
                                                                <Spinner animation="border" size="sm" variant="primary" />
                                                                <span className="ms-2">Loading tickets...</span>
                                                            </div>
                                                        )}
                                                        {!ticketsLoading && visibleTickets.length === 0 && (
                                                            <div className="text-center py-3 text-muted">
                                                                No tickets available.
                                                            </div>
                                                        )}
                                                {!ticketsLoading && visibleTickets.map((ticket) => {
                                                    const qty = quantities[ticket.id] || 0;
                                                    const subtotal = qty * ticket.price;
                                                    const status = getTicketDateStatus(ticket);
                                                    const isDisabled = !status.isCartAvailable;

                                                    return (
                                                        <div key={ticket.id} className="p-2 rounded-2 mb-3" style={{ backgroundColor: isDisabled ? "#e9ecef" : "#f8f9fa", opacity: isDisabled ? 0.7 : 1 }}>
                                                            <div className="mb-2">
                                                                <span className="fw-bold text-primary me-1">
                                                                    {ticket.name}
                                                                </span>
                                                                <span className="text-muted small" style={{ fontSize: "0.78rem" }}>
                                                                    ({ticket.seatsRemaining} seats remaining)
                                                                </span>
                                                                {status.isUpcoming && (
                                                                    <div className="text-primary small mt-1 fw-semibold">
                                                                        <IconifyIcon icon="lucide:calendar" className="me-1" style={{ verticalAlign: "-0.15em" }} /> For Registration (Starts {status.startFormatted} )
                                                                    </div>
                                                                )}
                                                                {!status.isUpcoming && (status.ticketCloseFormatted || status.endFormatted) && (
                                                                    <div className="text-muted small mt-1">
                                                                        For Registration (Till {status.ticketCloseFormatted || status.endFormatted} )
                                                                    </div>
                                                                )}
                                                                {status.isSoldOut && (
                                                                    <div className="text-danger small mt-1 fw-bold">
                                                                        Registration Completed
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="border-dashed p-2 mt-2">
                                                                <div className="row text-muted small mb-1">
                                                                    <div className="col-4 text-start">Pass Price:</div>
                                                                    <div className="col-4 text-center">Quantity</div>
                                                                    <div className="col-4 text-end">Subtotal:</div>
                                                                </div>

                                                                <div className="row align-items-center fw-bold">
                                                                    <div className="col-4 text-start text-dark small">
                                                                        ₹{ticket.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                    </div>

                                                                    <div className="col-4">
                                                                        {!isDisabled ? (
                                                                        <div className="quantityCart" >
                                                                            <button
                                                                                className="btn btn-link text-decoration-none text-dark p-0 px-2 fw-bold bg-white"
                                                                                type="button"
                                                                                onClick={() => updateQuantity(ticket.id, -1)}
                                                                                disabled={qty === 0}
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span className="px-2 py-1 small fw-normal text-secondary">
                                                                                {qty}
                                                                            </span>
                                                                            <button
                                                                                className="btn btn-link text-decoration-none text-dark p-0 px-2 fw-bold bg-white"
                                                                                type="button"
                                                                                onClick={() => updateQuantity(ticket.id, 1)}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        ) : (
                                                                            <span className={`badge ${status.isUpcoming ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                                                {status.isSoldOut ? "Registration Closed" : status.isUpcoming ? "Upcoming" : "Registration Closed"}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-4 text-end text-dark small">
                                                                        ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {(status.bookingCloseFormatted || regCloseFormatted) && (
                                                                <div className="text-muted small mt-2 pt-1 border-top text-center">
                                                                    <span><IconifyIcon icon="lucide:clock" className="me-1" style={{ verticalAlign: "-0.15em" }} /> Registration Would be Close After {status.bookingCloseFormatted || regCloseFormatted}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                <div className="d-flex justify-content-between align-items-center mt-4 mb-3 fw-bold text-dark">
                                                    <span>Quantity: {totalQuantity}</span>
                                                    <span>Total: {formatCurrency(totalPrice)}</span>
                                                </div>
                                            </>
                                        )}

                                        {isAuthenticated ? (
                                        <button
                                            type="button"
                                            className="btn w-100 py-2 fw-bold text-uppercase"
                                            style={{
                                                backgroundColor: totalQuantity > 0 ? "#f00" : "#d0d5dd",
                                                borderColor: totalQuantity > 0 ? "#f00" : "#d0d5dd",
                                                color: totalQuantity > 0 ? "#ffffff" : "#667085",
                                                cursor: totalQuantity > 0 ? "pointer" : "not-allowed",
                                                borderRadius: "6px"
                                            }}
                                            disabled={totalQuantity === 0}
                                            onClick={() => {
                                                const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;

                                                let hasPastPrimaryTicket = false;
                                                for (const b of bookings || []) {
                                                    const bEventId = b.eventId?._id || b.eventId?.id || b.eventId;
                                                    const currentEventId = event?._id || event?.id;
                                                    if (bEventId === currentEventId) {
                                                        for (const bt of b.tickets || []) {
                                                            const bTicketId = bt.ticketId?._id || bt.ticketId?.id || bt.ticketId;
                                                            const relatedTicket = tickets.find((t: any) => t._id === bTicketId || t.id === bTicketId);
                                                            const ticketGroupId = (relatedTicket?.groupId as any)?._id || relatedTicket?.groupId;
                                                            const isRelAccPerson = (relatedTicket as any)?.ticketName?.toLowerCase().includes('accompany') || (relatedTicket as any)?.name?.toLowerCase().includes('accompany');
                                                            if ((ticketGroupId && ticketGroupId !== accPersonGroupId) && !isRelAccPerson) {
                                                                hasPastPrimaryTicket = true;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (hasPastPrimaryTicket) break;
                                                }

                                                // Collect selected tickets
                                                const selectedTickets = validTickets.filter(t => (quantities[t.id] || 0) > 0);

                                                // Resolve each ticket's groupId (may be object or plain string)
                                                const resolveGId = (t: any): string => ((t.groupId as any)?._id || t.groupId || "") as string;

                                                // Separate into primary passes and accompanying person passes
                                                const primaryPasses = selectedTickets.filter(t => {
                                                    const gId = resolveGId(t);
                                                    const isAccName = (t as any).ticketName?.toLowerCase().includes('accompany') || (t as any).name?.toLowerCase().includes('accompany');
                                                    return (gId && gId !== accPersonGroupId) && !isAccName;
                                                });
                                                const accPersonPasses = selectedTickets.filter(t => {
                                                    const gId = resolveGId(t);
                                                    const isAccName = (t as any).ticketName?.toLowerCase().includes('accompany') || (t as any).name?.toLowerCase().includes('accompany');
                                                    return gId === accPersonGroupId || isAccName || !gId;
                                                });

                                                // Rule: must select at least one primary pass before accompanying person passes
                                                if (accPersonPasses.length > 0 && primaryPasses.length === 0) {
                                                    if (!hasPastPrimaryTicket) {
                                                        Swal.fire({
                                                            icon: 'warning',
                                                            title: 'Attention!',
                                                            text: 'Please select at least one primary pass (Member, Resident, or Non-Member) along with an Accompanying Person pass.',
                                                        });
                                                        return;
                                                    }
                                                }

                                                // Rule: only one type of primary pass allowed
                                                const uniquePrimaryGroups = new Set(primaryPasses.map(t => resolveGId(t)));
                                                if (uniquePrimaryGroups.size > 1) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: 'Attention!',
                                                        text: 'Please select only one option Member, Non-Member, or Resident at a time for a single member.',
                                                    });
                                                    return;
                                                }


                                                // All validations passed — proceed to checkout
                                                const checkoutData = {
                                                    event: {
                                                        id: event?._id || event?.id,
                                                        title: event?.title || "",
                                                        date: event?.startDate || "",
                                                        startTime: event?.startTime || "",
                                                        venue: event?.venueLocation || "",
                                                    },
                                                    totalQuantity,
                                                    totalPrice,
                                                    tickets: selectedTickets.map(t => ({
                                                        ...t,
                                                        quantity: quantities[t.id]
                                                    }))
                                                };
                                                sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
                                                router.push("/checkout");
                                            }}
                                        >
                                            GET PASS
                                        </button>
                                        ) : (
                                        <button
                                            type="button"
                                            className="btn w-100 py-2 fw-bold text-uppercase"
                                            style={{
                                                backgroundColor: "#f00",
                                                borderColor: "#f00",
                                                color: "#ffffff",
                                                cursor: "pointer",
                                                borderRadius: "6px"
                                            }}
                                            onClick={() => {
                                                router.push(`/login?next=/event-details/${eventId}`);
                                            }}
                                        >
                                            BUY PASS
                                        </button>
                                        )}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                    )}
                </Container>
            </main>

            <Footer />
        </div>
        </>
    );
};

export default EventDetailsClient;
