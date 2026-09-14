"use client";

import React, { useState, useEffect } from 'react';
import AttendeeList from './AttendeeList';
import BookingSummary from './BookingSummary';
import { useRouter } from 'next/navigation';
import { useSettingsContext } from '@/context/useSettingsContext';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchFrontendEventById } from "@/redux/slices/frontEnd/eventSlice";
import { createCheckoutOrder, verifyCheckoutPayment } from "@/redux/slices/frontEnd/checkoutSlice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceTemplate } from "@/app/(frontEnd)/profile/components/InvoiceTemplate";
import { TicketTemplate } from "@/app/(frontEnd)/profile/components/TicketTemplate";
import dayjs from "dayjs";

const CheckoutClient = () => {
    const [eventDetails, setEventDetails] = useState({
        title: "Loading event details...",
        date: "",
        venue: "",
        pricePerPerson: 0
    });
    
    const { setting } = useSettingsContext();
    const underAgeLimit = parseInt(setting('general.under_age', '10')) || 10;
    
    const dispatch = useDispatch<AppDispatch>();
    const { currentEvent } = useSelector((state: RootState) => state.frontendEvents);
    const { user } = useSelector((state: RootState) => state.frontendUser);
    
    const [tickets, setTickets] = useState<{name: string, quantity: number, price: number, id?: string, _id?: string}[]>([]);
    
    const [pdfGenerationData, setPdfGenerationData] = useState<{bookingId: string, attendees: any[]} | null>(null);

    const [attendees, setAttendees] = useState<{ id: number; name: string; age: string; relation: string; ticketName: string; isPrimary?: boolean }[]>([
        { id: 1, name: '', age: '', relation: '', ticketName: '' }
    ]);
    const [invalidAttendeeIds, setInvalidAttendeeIds] = useState<number[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [downloadingTxn, setDownloadingTxn] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = sessionStorage.getItem("checkoutData");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.event) {
                    let initialDate = data.event.date || "";
                    if (initialDate && initialDate.includes("T")) {
                        try {
                            const d = new Date(initialDate);
                            initialDate = d.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
                        } catch(e) {}
                    }
                    if (initialDate && data.event.startTime) {
                        initialDate += `, ${data.event.startTime}`;
                    }
                    
                    setEventDetails({
                        title: data.event.title || "Selected Event",
                        date: initialDate,
                        venue: data.event.venue || "",
                        pricePerPerson: data.totalQuantity > 0 ? (data.totalPrice / data.totalQuantity) : 0
                    });

                    if (data.tickets) {
                        setTickets(data.tickets);
                    }

                    // Fetch up-to-date event data using Redux
                    if (data.event.id) {
                        dispatch(fetchFrontendEventById(data.event.id));
                    }
                }
                
                if (data.totalQuantity > 0) {
                    let loggedInUserName = "";
                    try {
                        const userStr = typeof window !== "undefined" ? localStorage.getItem("user") || sessionStorage.getItem("user") : null;
                        if (userStr) {
                            const user = JSON.parse(userStr);
                            loggedInUserName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "");
                        }
                    } catch(e) {}

                    const initialAttendees: { id: number; name: string; age: string; relation: string; ticketName: string; isPrimary?: boolean }[] = [];
                    let idCounter = Date.now();
                    let userAssigned = false;
                    if (data.tickets && data.tickets.length > 0) {
                        data.tickets.forEach((t: any) => {
                            const accPersonGroupId = process.env.NEXT_PUBLIC_ACCOMPANYING_PERSON_GROUP_ID;
                            const tGroupIdStr = t.groupId?._id || t.groupId || "";
                            const isPrimary = tGroupIdStr !== accPersonGroupId && !t.name?.toLowerCase().includes('accompanying');

                            for (let i = 0; i < t.quantity; i++) {
                                let prefillName = '';
                                if (!userAssigned && isPrimary) {
                                    prefillName = loggedInUserName;
                                    userAssigned = true;
                                }

                                initialAttendees.push({
                                    id: idCounter++,
                                    name: prefillName,
                                    age: '',
                                    relation: '',
                                    ticketName: t.name,
                                    isPrimary: isPrimary
                                });
                            }
                        });
                    } else {
                        for (let i = 0; i < data.totalQuantity; i++) {
                            initialAttendees.push({
                                id: idCounter++,
                                name: initialAttendees.length === 0 ? loggedInUserName : '',
                                age: '',
                                relation: '',
                                ticketName: 'Attendee Pass',
                                isPrimary: true
                            });
                        }
                    }
                    setAttendees(initialAttendees);
                }
            } catch (e) {
                console.error("Failed to parse checkout data", e);
            }
        }
        setIsLoaded(true);

        // Load Razorpay checkout script dynamically
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [dispatch]);

    useEffect(() => {
        if (currentEvent) {
            let formattedDate = currentEvent.startDate || eventDetails.date;
            if (currentEvent.startDate) {
                try {
                    const d = new Date(currentEvent.startDate);
                    formattedDate = d.toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    if (currentEvent.startTime) formattedDate += `, ${currentEvent.startTime}`;
                } catch(e) {}
            }

            setEventDetails(prev => ({
                ...prev,
                title: currentEvent.title || prev.title,
                date: formattedDate,
                venue: currentEvent.venueLocation || prev.venue
            }));
        }
    }, [currentEvent, eventDetails.date]);

    const handleRemoveAttendee = (id: number) => {
        if (attendees.length > 1) {
            const attendeeToRemove = attendees.find(a => a.id === id);
            setAttendees(attendees.filter(a => a.id !== id));
            
            if (attendeeToRemove && attendeeToRemove.ticketName) {
                setTickets(prev => {
                    const newTickets = [...prev];
                    const ticketIndex = newTickets.findIndex(t => t.name === attendeeToRemove.ticketName);
                    if (ticketIndex !== -1 && newTickets[ticketIndex].quantity > 0) {
                        newTickets[ticketIndex] = { ...newTickets[ticketIndex], quantity: newTickets[ticketIndex].quantity - 1 };
                    }
                    return newTickets.filter(t => t.quantity > 0);
                });
            }
        }
    };



    const handleAttendeeChange = (id: number, field: string, value: string) => {
        setAttendees(attendees.map(a => a.id === id ? { ...a, [field]: value } : a));
        if (field === 'name' && value.trim() !== '') {
            setInvalidAttendeeIds(prev => prev.filter(invalidId => invalidId !== id));
        }
    };

    const handleGoBack = () => {
        const stored = sessionStorage.getItem("checkoutData");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                data.tickets = tickets;
                data.totalQuantity = tickets.reduce((sum, t) => sum + t.quantity, 0);
                data.totalPrice = tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0);
                sessionStorage.setItem("checkoutData", JSON.stringify(data));
                
                if (data.event?.id) {
                    router.push(`/event-details/${data.event.id}`);
                    return;
                }
            } catch (e) {}
        }
        router.back();
    };

    const processedTickets = React.useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        const result: {name: string, quantity: number, price: number, originalId?: any}[] = [];
        
        attendees.forEach(a => {
            const ticket = tickets.find(t => t.name === a.ticketName);
            if (ticket) {
                const ageNum = parseInt(a.age);
                const isUnderAge = !a.isPrimary && !isNaN(ageNum) && ageNum < underAgeLimit;
                const finalPrice = isUnderAge ? 0 : ticket.price;
                const finalName = isUnderAge ? `${ticket.name} (Under ${underAgeLimit})` : ticket.name;
                
                const existing = result.find(r => r.name === finalName && r.price === finalPrice);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    result.push({
                        name: finalName,
                        quantity: 1,
                        price: finalPrice,
                        originalId: ticket.id || (ticket as any)._id
                    });
                }
            }
        });
        return result;
    }, [attendees, tickets]);

    const totalAmount = processedTickets.length > 0 
        ? processedTickets.reduce((sum, t) => sum + (t.price * t.quantity), 0)
        : attendees.length * eventDetails.pricePerPerson;

    const handleProceedToPayment = async () => {
        try {
            // Validate inputs
            const invalidIds = attendees.filter(a => {
                if (!a.name || a.name.trim() === '') return true;
                if (a.isPrimary === false) {
                    if (!a.age || a.age.trim() === '') return true;
                    if (!a.relation || a.relation.trim() === '') return true;
                }
                return false;
            }).map(a => a.id);
            if (invalidIds.length > 0) {
                setInvalidAttendeeIds(invalidIds);
                const firstInvalid = document.getElementById(`attendee-name-${invalidIds[0]}`);
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            setIsProcessing(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            
            // 1. Fetch Keys and Logo from Settings
            const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
            const rzpKeySecret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ?? "";

            let appLogo = setting('general.logo', '/logo.png');
           
            if (appLogo) {
                const API_URL_BASE = process.env.NEXT_PUBLIC_BASE_URL+'/uploads/' || "http://localhost:3000";
                appLogo = `${API_URL_BASE}${appLogo}`;
            }

            const processBooking = async (response: any) => {
                try {
                    // 3. Prepare data for MongoDB
                    const stored = sessionStorage.getItem("checkoutData");
                    const checkoutData = stored ? JSON.parse(stored) : null;
                    
                    const paymentMethodStr = totalAmount === 0 ? "Free" : "Razorpay";
                    
                    const bookingData = {
                        eventId: checkoutData?.event?.id,
                        userId: user?.id || user?._id || null,
                        billingInfo: {
                            firstName: user?.name || "Guest",
                            email: user?.email || "",
                            phone: user?.mobile || ""
                        },
                        tickets: processedTickets.map(t => ({
                            ticketId: t.originalId,
                            ticketName: t.name,
                            price: t.price,
                            quantity: t.quantity,
                            attendees: attendees.filter(a => {
                                const ageNum = parseInt(a.age);
                                const isUnderAge = !a.isPrimary && !isNaN(ageNum) && ageNum < underAgeLimit;
                                const finalName = isUnderAge ? `${a.ticketName} (Under ${underAgeLimit})` : a.ticketName;
                                return finalName === t.name;
                            }).map(a => ({ name: a.name, age: a.age, relation: a.relation }))
                        })),
                        totalAmount,
                        paymentMethod: paymentMethodStr
                    };

                    const attendeesData = attendees.map(a => {
                        const ageNum = parseInt(a.age);
                        const isUnderAgeLimit = !a.isPrimary && !isNaN(ageNum) && ageNum < underAgeLimit;
                        const ticket = tickets.find(t => t.name === a.ticketName);
                        return {
                            eventId: checkoutData?.event?.id,
                            name: a.name,
                            age: a.age,
                            relation: a.relation,
                            ticketName: isUnderAgeLimit ? `${a.ticketName} (Under ${underAgeLimit})` : a.ticketName,
                            ticketId: ticket?._id || ticket?.id,
                            ticketPrice: isUnderAgeLimit ? 0 : (ticket?.price || 0),
                            ticketStatus: "Unused"
                        };
                    });

                    const transactionData = {
                        description: `${eventDetails.title} Registration Fee`,
                        paymentMethod: paymentMethodStr,
                        amount: totalAmount,
                        userId: user?.id || user?._id || null,
                        eventId: checkoutData?.event?.id
                    };
                    
                    // Prepare temporary txn object for the invoice template
                    const provisionalTxn = {
                        id: response.razorpay_payment_id || `free_${Date.now()}`,
                        transactionRef: response.razorpay_payment_id || `free_${Date.now()}`,
                        date: dayjs().format('DD MMMM YYYY, hh:mm A'),
                        description: transactionData.description,
                        paymentMethod: transactionData.paymentMethod,
                        amount: `₹ ${totalAmount}`,
                        status: "Completed",
                        type: "Event Ticket",
                        eventName: eventDetails.title,
                        tickets: processedTickets.map(t => ({
                            name: t.name || "Event Ticket",
                            quantity: t.quantity,
                            unitPrice: `₹ ${Number(t.price).toFixed(2)}`,
                            totalPrice: `₹ ${Number(t.price * t.quantity).toFixed(2)}`
                        })),
                        quantity: processedTickets.reduce((sum, t) => sum + t.quantity, 0),
                        unitPrice: `₹ ${totalAmount}`,
                    };
                    setDownloadingTxn(provisionalTxn);

                    // 4. Verify Payment and Store Data via Redux Slice
                    const verifyData = await dispatch(verifyCheckoutPayment({
                        razorpay_order_id: response.razorpay_order_id || null,
                        razorpay_payment_id: response.razorpay_payment_id || provisionalTxn.id,
                        razorpay_signature: response.razorpay_signature || null,
                        key_secret: rzpKeySecret,
                        bookingData,
                        attendeesData,
                        transactionData
                    })).unwrap();
                    
                    // If unwrap succeeds, it means verification was successful
                    if (verifyData && verifyData.success !== false) {
                        setIsRedirecting(true);
                        const bookingId = verifyData.bookingId;
                        setPdfGenerationData({ bookingId, attendees: attendeesData });
                        
                        // Generate and Upload PDF
                        setTimeout(async () => {
                            const element = document.getElementById("checkout-invoice-template-container");
                            if (element && bookingId) {
                                try {
                                    const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
                                    const imgData = canvas.toDataURL("image/png");
                                    const pdf = new jsPDF("p", "mm", "a4");
                                    const pdfWidth = pdf.internal.pageSize.getWidth();
                                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                                    const pdfBase64 = pdf.output('datauristring');
                                    
                                    const ticketPdfBase64s = [];
                                    for (let i = 0; i < attendeesData.length; i++) {
                                        const ticketEl = document.getElementById(`checkout-ticket-template-${i}`);
                                        if (ticketEl) {
                                            const tCanvas = await html2canvas(ticketEl, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
                                            const tImgData = tCanvas.toDataURL("image/png");
                                            const tPdf = new jsPDF("p", "mm", "a4");
                                            const tPdfWidth = tPdf.internal.pageSize.getWidth();
                                            const tPdfHeight = (tCanvas.height * tPdfWidth) / tCanvas.width;
                                            tPdf.addImage(tImgData, "PNG", 0, 0, tPdfWidth, tPdfHeight);
                                            ticketPdfBase64s.push(tPdf.output('datauristring'));
                                        } else {
                                            console.error(`Ticket template ${i} not found in DOM`);
                                        }
                                    }

                                    await fetch(`${API_URL}/checkout/upload-invoice/${bookingId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ pdfBase64, ticketPdfBase64s })
                                    });
                                } catch (err) {
                                    console.error("PDF generation/upload failed", err);
                                }
                            }
                        
                            sessionStorage.removeItem("checkoutData");
                            router.push("/profile?payment_success=true");
                        }, 2500);
                    } else {
                        alert("Payment verification failed. Please contact support.");
                        setIsProcessing(false);
                    }
                } catch (err) {
                    console.error("Verification error", err);
                    alert("An error occurred during verification.");
                    setIsProcessing(false);
                }
            };

            if (totalAmount === 0) {
                try {
                    const freeOrderId = `ref_${Date.now()}`;
                    const freePaymentId = `ref_${Date.now()}`;
                    const message = `${freeOrderId}|${freePaymentId}`;
                    
                    const encoder = new TextEncoder();
                    const keyData = encoder.encode(rzpKeySecret);
                    const msgData = encoder.encode(message);

                    const cryptoKey = await window.crypto.subtle.importKey(
                        'raw',
                        keyData,
                        { name: 'HMAC', hash: 'SHA-256' },
                        false,
                        ['sign']
                    );

                    const signatureBuffer = await window.crypto.subtle.sign(
                        'HMAC',
                        cryptoKey,
                        msgData
                    );

                    const signature = Array.from(new Uint8Array(signatureBuffer))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');

                    await processBooking({
                        razorpay_order_id: freeOrderId,
                        razorpay_payment_id: freePaymentId,
                        razorpay_signature: signature
                    });
                } catch (e) {
                    console.error("Failed to generate free booking signature", e);
                    alert("Error processing free booking.");
                    setIsProcessing(false);
                }
                return;
            }

            // 2. Create Order via Redux Slice
            const orderData = await dispatch(createCheckoutOrder({
                amount: totalAmount,
                key_id: rzpKeyId,
                key_secret: rzpKeySecret
            })).unwrap();

            // 3. Prepare Razorpay Options
            const options = {
                key: orderData.key_id || rzpKeyId, 
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: setting('general.title', 'AISGWB Events'),
                description: eventDetails.title,
                image: appLogo,
                order_id: orderData.order.id,
                handler: processBooking,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || ""
                },
                theme: {
                    color: "#0d6efd"
                }
            };
            
            // LIVE/TEST MODE with real keys
            if (typeof (window as any).Razorpay === 'undefined') {
                throw new Error("Razorpay SDK failed to load. Please check your internet connection or disable adblockers.");
            }

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any){
                console.error("Payment failed", response.error);
                alert(`Payment Failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp1.open();
        } catch (error: any) {
            console.error(error);
            const errMsg = typeof error === 'string' ? error : error?.message || "Could not initialize payment gateway.";
            alert(`Payment Gateway Error: ${errMsg}`);
            setIsProcessing(false);
        }
    };

    if (!isLoaded) return null; // Avoid hydration mismatch

    return (
        <main className="container flex-grow-1 py-4 py-lg-5 mt-3 checkout-page">
            <div className="row g-4 align-items-start">
                <AttendeeList 
                    attendees={attendees} 
                    onRemoveAttendee={handleRemoveAttendee} 
                    onChangeAttendee={handleAttendeeChange} 
                    invalidAttendeeIds={invalidAttendeeIds}
                />
                
                <BookingSummary 
                    eventDetails={eventDetails} 
                    totalPersons={attendees.length}
                    tickets={processedTickets as any}
                    totalAmount={totalAmount}
                    onProceed={handleProceedToPayment}
                    isProcessing={isProcessing}
                    onBack={handleGoBack}
                />
            </div>
            
            {downloadingTxn && (
                <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                    <InvoiceTemplate transaction={downloadingTxn} user={user} id="checkout-invoice-template-container" />
                    
                    {pdfGenerationData && pdfGenerationData.attendees.map((att, i) => (
                        <div id={`checkout-ticket-template-${i}`} key={i}>
                            <TicketTemplate 
                                attendee={{...att, ticketName: downloadingTxn.tickets.find((t: any) => t.name.includes(att.ticketName || ''))?.name || att.ticketName}} 
                                eventDetails={{
                                    ...eventDetails,
                                    startDate: currentEvent?.startDate,
                                    endDate: currentEvent?.endDate,
                                    startTime: currentEvent?.startTime,
                                    endTime: currentEvent?.endTime,
                                }} 
                                user={user} 
                                bookingId={pdfGenerationData.bookingId} 
                                pdfMode={true}
                            />
                        </div>
                    ))}
                </div>
            )}

            {isRedirecting && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="fw-bold text-dark">Your booking is successful!</h4>
                    <p className="text-muted fs-5">Generating your tickets and redirecting. Please wait...</p>
                </div>
            )}
        </main>
    );
};

export default CheckoutClient;
