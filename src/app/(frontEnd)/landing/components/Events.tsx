"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Container, Spinner } from "react-bootstrap";
import { Icon as IconifyIcon } from '@iconify/react';
import moment from 'moment';
import EventLink from './EventLink';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchFrontendEvents } from "@/redux/slices/frontEnd/eventSlice";

const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector((state: RootState) => state.frontendEvents);

  useEffect(() => {
    dispatch(fetchFrontendEvents());
  }, [dispatch]);

  return (
    <section className="section-custom bg-light bg-opacity-30 border-top border-light border-bottom" id="events">
      <Container>
        <div className="event-list">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <h4>Error loading events: {error}</h4>
            </div>
          ) : events.length > 0 ? (
            events.map((event: any) => (
              <div className="event-item mb-4" key={event._id || event.id}>
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <div className="event-thumb">
                      <EventLink eventId={event._id || event.id}>
                        <Image src={event.banner || event.logo || "https://dtechsystem.co.in/aisgwb/wp-content/uploads/2025/12/29th-annual-Conference.jpg"} alt={event.title} width={200} height={200} className="img-fluid rounded" />
                      </EventLink>
                    </div>
                  </div>
                  <div className="col-md-9 col-lg-7">
                    <div className="calendar-event-content">
                      <h3 className="calendar-event-title title event-title">
                        <EventLink eventId={event._id || event.id}>{event.title}</EventLink>
                      </h3>
                      <ul className="calendar-event-time-vanue list-unstyled">
                        <li className="event-calender-vanue event-calender-time mb-2">
                          <IconifyIcon icon="lucide:calendar" className="fs-xl me-2" />
                          {event.startDate ? moment(event.startDate).format("MMMM DD, YYYY") : ''}
                          {event.endDate && event.endDate !== event.startDate && (
                            <span><span className="mx-1">To</span>{moment(event.endDate).format("MMMM DD, YYYY")}</span>
                          )}
                        </li>
                        {event.venueLocation && (
                          <li className="event-calender-vanue">
                            <IconifyIcon icon="lucide:map-pin" className="fs-xl me-2" />
                            <span>{event.venueLocation}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    <EventLink eventId={event._id || event.id} className="btn btn-primary mt-2" isButton={true}>See Details</EventLink>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <h4>No upcoming events found.</h4>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Events;
