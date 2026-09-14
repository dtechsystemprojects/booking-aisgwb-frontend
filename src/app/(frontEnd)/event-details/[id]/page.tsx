import React from 'react';
import EventDetailsClient from './EventDetailsClient';
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event Details" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    return <EventDetailsClient eventId={resolvedParams.id} />;
}
