"use client";

import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

interface Attendee {
    id: number;
    name: string;
    age: string;
    relation: string;
    ticketName?: string;
    isPrimary?: boolean;
}

interface AttendeeListProps {
    attendees: Attendee[];
    onRemoveAttendee: (id: number) => void;
    onChangeAttendee: (id: number, field: string, value: string) => void;
    invalidAttendeeIds?: number[];
}

const AttendeeList: React.FC<AttendeeListProps> = ({ 
    attendees, 
    onRemoveAttendee, 
    onChangeAttendee,
    invalidAttendeeIds = []
}) => {
    return (
        <div className="col-lg-8">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h1 className="h3 fw-bold text-dark mb-1">Attendee Details</h1>
                    <p className="text-muted mb-0">Please provide the details of all individuals attending.</p>
                </div>
            </div>
            
            <div className="d-flex flex-column gap-4">
                {attendees.map((attendee, index) => (
                    <div key={attendee.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom pb-3 pt-4 px-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>
                                    {index + 1}
                                </div>
                                <h5 className="fs-5 fw-bold text-dark mb-0 d-flex align-items-center flex-wrap gap-2">
                                    Attendee Details
                                    {attendee.ticketName && (
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill fs-sm fw-medium px-3 py-1">
                                            {attendee.ticketName}
                                        </span>
                                    )}
                                </h5>
                            </div>
                            {attendees.length > 1 && (
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-remove-${attendee.id}`}>Remove Attendee</Tooltip>}
                                >
                                    <button 
                                        onClick={() => onRemoveAttendee(attendee.id)}
                                        className="btn btn-sm btn-light text-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                                        style={{ width: '36px', height: '36px' }}
                                    >
                                        <IconifyIcon icon="lucide:trash-2" width="18" />
                                    </button>
                                </OverlayTrigger>
                            )}
                        </div>
                        <div className="card-body p-4 bg-white">
                            <div className="row g-4">
                                <div className={attendee.isPrimary !== false ? "col-md-12" : "col-md-5"}>
                                    <label className="form-label fw-semibold">
                                        Full Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id={`attendee-name-${attendee.id}`}
                                        type="text"
                                        className={`form-control ${invalidAttendeeIds.includes(attendee.id) ? 'is-invalid border-danger' : ''}`}
                                        value={attendee.name}
                                        onChange={(e) => onChangeAttendee(attendee.id, 'name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {invalidAttendeeIds.includes(attendee.id) && (
                                        <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                                            <IconifyIcon icon="lucide:alert-circle" width="14" />
                                            Full Name is required
                                        </div>
                                    )}
                                </div>
                                {attendee.isPrimary === false && (
                                    <>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Age <span className="text-danger">*</span></label>
                                            <input
                                                type="number"
                                                className={`form-control ${invalidAttendeeIds.includes(attendee.id) ? 'is-invalid border-danger' : ''}`}
                                                value={attendee.age}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    onChangeAttendee(attendee.id, 'age', val);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                min="1"
                                                max="120"
                                                placeholder="1"
                                                required
                                            />
                                            {invalidAttendeeIds.includes(attendee.id) && (
                                                <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                                                    <IconifyIcon icon="lucide:alert-circle" width="14" />
                                                    Age is required
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">Relation <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className={`form-control ${invalidAttendeeIds.includes(attendee.id) ? 'is-invalid border-danger' : ''}`}
                                                value={attendee.relation}
                                                onChange={(e) => onChangeAttendee(attendee.id, 'relation', e.target.value)}
                                                placeholder="e.g. Spouse, Child"
                                                required
                                            />
                                            {invalidAttendeeIds.includes(attendee.id) && (
                                                <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                                                    <IconifyIcon icon="lucide:alert-circle" width="14" />
                                                    Relation is required
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendeeList;
