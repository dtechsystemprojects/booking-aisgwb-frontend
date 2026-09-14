"use client";

import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

interface EventDetails {
    title: string;
    date: string;
    venue: string;
    pricePerPerson: number;
}

interface Ticket {
    name: string;
    quantity: number;
    price: number;
}

interface BookingSummaryProps {
    eventDetails: EventDetails;
    totalPersons: number;
    tickets?: Ticket[];
    totalAmount: number;
    onProceed: () => void;
    isProcessing: boolean;
    onBack?: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ 
    eventDetails, 
    totalPersons,
    tickets,
    totalAmount,
    onProceed,
    isProcessing,
    onBack
}) => {
    return (
        <div className="col-lg-4 summary-sticky">
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-3">
                    <h4 className="card-title h5 fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
                        <IconifyIcon icon="lucide:shopping-bag" className="text-primary" />
                        Booking Summary
                    </h4>
                    
                    <div className="mb-2">
                        <div className="fw-bold text-dark mb-3 lh-base fs-6">
                            {eventDetails.title}
                        </div>
                        <div className="d-flex align-items-start gap-3 text-secondary small mb-3">
                            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded">
                                <IconifyIcon icon="lucide:calendar" width="18" />
                            </div>
                            <div>
                                <div className="fw-semibold text-dark">Date & Time</div>
                                <span>{eventDetails.date}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-start gap-3 text-secondary small">
                            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded">
                                <IconifyIcon icon="lucide:map-pin" width="18" />
                            </div>
                            <div>
                                <div className="fw-semibold text-dark">Venue</div>
                                <span>{eventDetails.venue}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-body-secondary bg-opacity-50 rounded-4 p-2 mb-2">
                        {tickets && tickets.length > 0 ? (
                            tickets.map((t, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center mb-3 fs-sm">
                                    <span className="text-muted fw-medium">{t.name} (x{t.quantity})</span>
                                    <span className="fw-bold text-dark">₹{(t.price * t.quantity).toLocaleString("en-IN")}</span>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-3 fs-sm">
                                    <span className="text-muted fw-medium">Price per person</span>
                                    <span className="fw-bold text-dark">₹{eventDetails.pricePerPerson?.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3 fs-sm">
                                    <span className="text-muted fw-medium">Total Persons</span>
                                    <span className="fw-bold text-dark">x {totalPersons}</span>
                                </div>
                            </>
                        )}
                        <hr className="my-3 border-secondary border-opacity-25" />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark fs-6">Total Amount</span>
                            <span className="fw-bold text-primary fs-3">₹{totalAmount.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        {onBack && (
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id="tooltip-back">Back to Event</Tooltip>}
                            >
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="btn btn-outline-secondary py-3 rounded-pill fw-bold fs-6 d-flex align-items-center justify-content-center px-4"
                                >
                                    <IconifyIcon icon="lucide:arrow-left" width="20" />
                                </button>
                            </OverlayTrigger>
                        )}
                        <button 
                            type="button" 
                            onClick={onProceed}
                            disabled={isProcessing}
                            className="btn btn-primary flex-grow-1 py-3 rounded-pill fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                        >
                            {isProcessing ? "Processing..." : "Proceed to Payment"} 
                            {!isProcessing && <IconifyIcon icon="lucide:arrow-right" width="20" />}
                        </button>
                    </div>
                    
                    {/* <div className="mt-4 text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 text-success small fw-medium bg-success bg-opacity-10 py-2 px-3 rounded-pill d-inline-flex mx-auto">
                            <IconifyIcon icon="lucide:shield-check" width="16" /> 
                            256-bit Secure Encrypted Payment
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;
