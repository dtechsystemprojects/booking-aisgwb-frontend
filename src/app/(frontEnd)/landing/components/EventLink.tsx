"use client";
import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";

interface EventLinkProps {
  eventId: string;
  className?: string;
  children?: React.ReactNode;
  isButton?: boolean;
}

const EventLink: React.FC<EventLinkProps> = ({ eventId, className, children, isButton }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Only show the link if authenticated and user is a frontend user
  // if (isAuthenticated && user?.isFrontEnd) {
    return (
      <Link href={`/event-details/${eventId}`} className={className}>
        {children || "See Details"}
      </Link>
    );
  //}

  // If not authenticated or not a frontend user, clicking redirects to login
  // return (
  //   <Link href={`/login?next=/event-details/${eventId}`} className={className}>
  //     {children || "See Details"}
  //   </Link>
  // );
};

export default EventLink;
