import { Metadata } from "next";
import EventForm from "../components/EventForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Event Setup" };

const Page = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const resolvedParams = await searchParams;
  const id = typeof resolvedParams.id === "string" ? resolvedParams.id : undefined;
  const isEdit = !!id;
  
  return (
    <ProtectedRoute moduleName="Events">
      <EventForm mode={isEdit ? "edit" : "add"} eventId={id} />
    </ProtectedRoute>
  );
};

export default Page;
