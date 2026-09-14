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

    const updateQuantity = (id: string, delta: number) => {
        const ticketToAdd = tickets.find(t => t.id === id || t._id === id);
        
        if (delta > 0 && ticketToAdd) {
            const ticketGroupId = typeof ticketToAdd.groupId === 'object' && ticketToAdd.groupId !== null
                ? ticketToAdd.groupId._id
                : ticketToAdd.groupId;
            const memberGroupId = process.env.NEXT_PUBLIC_MEMBER_GROUP_ID;
            const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
            
            const isPrimaryPass = ticketGroupId && ticketGroupId !== accPersonGroupId;

            if (isPrimaryPass) {
                const otherPrimarySelected = tickets.find(t => {
                    const gId = typeof t.groupId === 'object' && t.groupId !== null
                        ? t.groupId._id
                        : t.groupId;
                    const isOtherPrimary = gId && gId !== accPersonGroupId;
                    return isOtherPrimary && (t.id !== id && t._id !== id) && (quantities[t.id ?? t._id ?? ''] || 0) > 0;
                });
                
                if (otherPrimarySelected) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Selection Error',
                        text: 'Please select only one option Member, Non-Member, or Resident at a time for a single member.',
                    });
                    return;
                }
                
                if (process.env.NEXT_PUBLIC_BOOKING_MULTIPLE_TICKET_ADD === 'false') {
                    let hasPastPrimaryTicket = false;
                    for (const b of bookings || []) {
                        const bEventId = b.eventId?._id || b.eventId?.id || b.eventId;
                        const currentEventId = event?._id || event?.id;
                        if (bEventId === currentEventId) {
                            for (const bt of b.tickets || []) {
                                const bTicketId = bt.ticketId?._id || bt.ticketId?.id || bt.ticketId;
                                const relatedTicket = tickets.find((t: any) => t._id === bTicketId || t.id === bTicketId);
                                const tGroupId = (relatedTicket?.groupId as any)?._id || relatedTicket?.groupId;
                                if (tGroupId && tGroupId !== accPersonGroupId) {
                                    hasPastPrimaryTicket = true;
                                    break;
                                }
                            }
                        }
                        if (hasPastPrimaryTicket) break;
                    }
                    
                    if (hasPastPrimaryTicket) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Attention!',
                            text: 'You have already booked a Primary pass for this event. You can only buy an Accompanying Person ticket.',
                        });
                        return;
                    }
                
                    const currentQty = quantities[id] || 0;
                    if (currentQty + delta > 1) {
                        Swal.fire({
                            icon: 'error',
                        title: 'Limit Exceeded',
                            text: 'You can only buy one primary pass per booking.',
                        });
                        return;
                    }
                }
                
                // Prefer live API data; fall back to cached user state if not yet loaded
                const isApprovedMember = myMembership?.status === 'Approved';
                if (isApprovedMember) {
                    if (ticketGroupId !== memberGroupId) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Attention!',
                            text: 'As an Approved Member, you can only purchase the Member pass.',
                        });
                        return;
                    }
                } else {
                    if (ticketGroupId === memberGroupId) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Attention!',
                            text: `Only approved members can purchase the Member pass. Your membership status is: ${myMembership?.status || 'Not Found'}.`,
                        });
                        return;
                    }
                }
            }
        }

        setQuantities((prev) => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [id]: next };
        });
    };

    const isTicketDisabled = (ticket: any) => {
        if (ticket.seatsRemaining <= 0) return true;
        
        const activeEndDate = ticket.endDate || event?.registrationClose || event?.endDate || event?.startDate;
        const activeEndTime = ticket.endTime || event?.endTime || '23:59:59';
        
        if (activeEndDate) {
            let dateObj = dayjs(activeEndDate, ["YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "DD MMM YYYY"], true);
            if (!dateObj.isValid()) dateObj = dayjs(activeEndDate);

            if (dateObj.isValid()) {
                let finalDate = dateObj.endOf('day');
                if (activeEndTime) {
                    let timeObj = dayjs(activeEndTime, ["HH:mm", "HH:mm:ss", "hh:mm A", "h:mm A", "h:mmA", "hh:mmA"], true);
                    if (!timeObj.isValid()) timeObj = dayjs(`1970-01-01T${activeEndTime}`); // fallback
                    if (timeObj.isValid()) {
                        finalDate = dateObj.hour(timeObj.hour()).minute(timeObj.minute()).second(timeObj.second());
                    }
                }
                
                if (finalDate.isBefore(dayjs())) {
                    return true;
                }
            }
        }
        return false;
    };

    const validTickets = tickets.filter(t => !isTicketDisabled(t));
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
                                        {isAuthenticated && (
                                            <>
                                                <h4 className="fw-bold text-dark mb-2 fs-4">Annual Conference Pass</h4>
                                                {ticketsLoading && (
                                                    <div className="text-center py-3">
                                                        <Spinner animation="border" size="sm" variant="primary" />
                                                        <span className="ms-2">Loading tickets...</span>
                                                    </div>
                                                )}
                                                {!ticketsLoading && tickets.length === 0 && (
                                                    <div className="text-center py-3 text-muted">
                                                        No tickets available.
                                                    </div>
                                                )}
                                                {!ticketsLoading && tickets.map((ticket) => {
                                                    const qty = quantities[ticket.id] || 0;
                                                    const subtotal = qty * ticket.price;
                                                    let endDateTimeFormatted = null;
                                                    let isExpired = false;
                                                    
                                                    const activeEndDate = ticket.endDate || event?.registrationClose || event?.endDate || event?.startDate;
                                                    const activeEndTime = ticket.endTime || event?.endTime || '23:59:59';

                                                    if (activeEndDate) {
                                                        let dateObj = dayjs(activeEndDate, ["YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "DD MMM YYYY"], true);
                                                        if (!dateObj.isValid()) dateObj = dayjs(activeEndDate);

                                                        if (dateObj.isValid()) {
                                                            endDateTimeFormatted = dateObj.format('MMM DD, YYYY');
                                                            
                                                            let finalDate = dateObj.endOf('day');
                                                            if (activeEndTime) {
                                                                let timeObj = dayjs(activeEndTime, ["HH:mm", "HH:mm:ss", "hh:mm A", "h:mm A", "h:mmA", "hh:mmA"], true);
                                                                if (!timeObj.isValid()) timeObj = dayjs(`1970-01-01T${activeEndTime}`); // fallback
                                                                if (timeObj.isValid()) {
                                                                    finalDate = dateObj.hour(timeObj.hour()).minute(timeObj.minute()).second(timeObj.second());
                                                                }
                                                            }
                                                            isExpired = finalDate.isBefore(dayjs());
                                                        }
                                                    }
                                                    
                                                    const isSoldOut = ticket.seatsRemaining <= 0;
                                                    const isDisabled = isSoldOut || isExpired;

                                                    return (
                                                        <div key={ticket.id} className="p-2 rounded-2 mb-3" style={{ backgroundColor: isDisabled ? "#e9ecef" : "#f8f9fa", opacity: isDisabled ? 0.7 : 1 }}>
                                                            <div className="mb-2">
                                                                <span className="fw-bold text-primary me-1">
                                                                    {ticket.name}
                                                                </span>
                                                                <span className="text-muted small" style={{ fontSize: "0.78rem" }}>
                                                                    ({ticket.seatsRemaining} seats remaining)
                                                                </span>
                                                                {endDateTimeFormatted && !isExpired && (
                                                                    <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                                                                        <i className="bi bi-clock me-1"></i> Sale will end on {endDateTimeFormatted}
                                                                    </div>
                                                                )}
                                                                {isDisabled && (
                                                                    <div className="text-danger small mt-1 fw-bold" style={{ fontSize: "0.8rem" }}>
                                                                        {isSoldOut ? "Sold Out" : `Sale Ended on ${endDateTimeFormatted}`}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="border-dashed p-2 mt-2" style={{ borderStyle: "dashed", borderWidth: "1px", borderColor: "#dee2e6" }}>
                                                                <div className="row text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
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
                                                                        <div className="quantityCart" style={{ borderColor: "#ced4da" }}>
                                                                            <button
                                                                                className="btn btn-link text-decoration-none text-dark p-0 px-2 fw-bold bg-white"
                                                                                style={{ fontSize: "0.9rem", lineHeight: "1" }}
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
                                                                                style={{ fontSize: "0.9rem", lineHeight: "1" }}
                                                                                type="button"
                                                                                onClick={() => updateQuantity(ticket.id, 1)}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        ) : (
                                                                            <span className="badge bg-secondary">Unavailable</span>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-4 text-end text-dark small">
                                                                        ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            </div>
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
                                                const memberGroupId = process.env.NEXT_PUBLIC_MEMBER_GROUP_ID;
                                                const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;

                                                const isApprovedMember = myMembership?.status === 'Approved';

                                                let hasPastPrimaryTicket = false;
                                                for (const b of bookings || []) {
                                                    const bEventId = b.eventId?._id || b.eventId?.id || b.eventId;
                                                    const currentEventId = event?._id || event?.id;
                                                    if (bEventId === currentEventId) {
                                                        for (const bt of b.tickets || []) {
                                                            const bTicketId = bt.ticketId?._id || bt.ticketId?.id || bt.ticketId;
                                                            const relatedTicket = tickets.find((t: any) => t._id === bTicketId || t.id === bTicketId);
                                                            const ticketGroupId = (relatedTicket?.groupId as any)?._id || relatedTicket?.groupId;
                                                            if (ticketGroupId && ticketGroupId !== accPersonGroupId) {
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
                                                const resolveGId = (t: any): string => (t.groupId?._id || t.groupId || "") as string;

                                                // Separate into primary passes and accompanying person passes
                                                const primaryPasses = selectedTickets.filter(t => {
                                                    const gId = resolveGId(t);
                                                    return gId && gId !== accPersonGroupId;
                                                });
                                                const accPersonPasses = selectedTickets.filter(t => {
                                                    const gId = resolveGId(t);
                                                    return gId === accPersonGroupId;
                                                });

                                                // Rule: must select at least one primary pass before accompanying person passes
                                                if (accPersonPasses.length > 0 && primaryPasses.length === 0) {
                                                    if (!hasPastPrimaryTicket) {
                                                        Swal.fire({
                                                            icon: 'error',
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
                                                        icon: 'error',
                                                        title: 'Selection Error',
                                                        text: 'Please select only one option Member, Non-Member, or Resident at a time for a single member.',
                                                    });
                                                    return;
                                                }

                                                if (primaryPasses.length > 0) {
                                                    const selectedGroupId = resolveGId(primaryPasses[0]);

                                                    if (isApprovedMember) {
                                                        // Approved Members → ONLY Member pass allowed; block Non-Member & Residents
                                                        if (selectedGroupId !== memberGroupId) {
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'Attention!',
                                                                text: 'As an Approved Member, you are not eligible to purchase Non-Member or Residents passes. Please select the Member pass only.',
                                                            });
                                                            return;
                                                        }
                                                    } else {
                                                        // Non-approved users → ONLY Residents or Non-Member pass allowed; block Member pass
                                                        if (selectedGroupId === memberGroupId) {
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'Attention!',
                                                                text: `You are not an Approved Member. Only Residents or Non-Member passes are available to you. Your membership status is: ${myMembership?.status || 'Not a Member'}.`,
                                                            });
                                                            return;
                                                        }
                                                    }
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
