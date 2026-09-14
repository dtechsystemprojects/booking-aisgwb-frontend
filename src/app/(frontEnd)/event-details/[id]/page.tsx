import React from 'react';
import EventDetailsClient from './EventDetailsClient';
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event Details" };

export default async function Page({ params }: { params: { id: string } | Promise<{ id: string }> }) {
    // Await params to support both Next.js 13/14 and Next.js 15+ routing
    const resolvedParams = await Promise.resolve(params);

    return <EventDetailsClient eventId={resolvedParams.id} />;
}
