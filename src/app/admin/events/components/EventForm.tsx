"use client";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Icon from "@/components/wrappers/Icon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Select from "@/components/wrappers/Select";
import Swal from "sweetalert2";
import Image from "next/image";
import toast from "react-hot-toast";

import { Editor } from "@tinymce/tinymce-react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormCheck,
  FormControl,
  FormLabel,
  FormSelect,
  Row,
  InputGroup,
  Dropdown,
  Form
} from "react-bootstrap";
import { EventRecord } from "@/app/admin/dataStore";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addEvent, updateEvent, clearEventError } from "@/redux/slices/admin/eventSlice";
import { fetchTickets, deleteTicket, updateTicket, fetchTicketGroups, Ticket } from "@/redux/slices/admin/ticketSlice";
import TicketModal from "./TicketModal";
import { useAccess } from "@/hooks/useAccess";

interface EventFormProps {
  mode: "add" | "edit";
  eventId?: string;
}

const EventForm: React.FC<EventFormProps> = ({ mode, eventId }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEdit = mode === "edit";
  const { write: canWrite } = useAccess("Events");

  const { events, loading, error } = useAppSelector((state) => state.events);
  const { tickets, loading: ticketsLoading, ticketGroups } = useAppSelector((state) => state.tickets);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [formData, setFormData] = useState<EventRecord>({
    title: "",
    slug: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    timezone: "",
    eventType: "Offline",
    venueLocation: "",
    onlinePlatformUrl: "",
    organizerId: "",
    logo: "",
    banner: "",
    maximumSeats: 100,
    status: "Draft",
    isActive: true,
  });

  const timeOptions = useMemo(() => {
    const times = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 24 * 60; i += 5) {
      const timeString = start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      times.push({ value: timeString, label: timeString });
      start.setMinutes(start.getMinutes() + 5);
    }
    return times;
  }, []);

  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleCloneTicket = (ticket: Ticket) => {
    const clonedTicket = { ...ticket, ticketName: `${ticket.ticketName} (Copy)` };
    delete clonedTicket._id;
    delete clonedTicket.id;
    setSelectedTicket(clonedTicket as any);
    setShowTicketModal(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    Swal.fire({
      title: "Delete Ticket?",
      text: "Are you sure you want to delete this ticket?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed && eventId) {
        dispatch(deleteTicket({ eventId, ticketId }));
        toast.success("Ticket deleted");
      }
    });
  };

  const handleToggleTicketActive = async (ticket: Ticket) => {
    if (!eventId) return;
    try {
      await dispatch(updateTicket({ 
        eventId, 
        ticketId: (ticket._id || ticket.id) as string, 
        ticketData: { isActive: !ticket.isActive } 
      })).unwrap();
      toast.success(`Ticket ${ticket.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error("Failed to update ticket status");
    }
  };

  const handleFileUpload = async (
    field: "logo" | "banner",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("File size exceeds 2MB limit. Please select a smaller image.");
      event.target.value = "";
      return;
    }

    if (field === "logo") setUploadingLogo(true);
    else setUploadingBanner(true);
    setErrorMessage("");

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        const resData = await response.json();
        const uploadedUrl = resData.data?.url || resData.url;
        if (uploadedUrl) {
          handleChange(field, uploadedUrl);
        } else {
          setErrorMessage("Failed to upload file. No URL returned.");
        }
      } else {
        const errData = await response.json();
        setErrorMessage(errData.message || "Failed to upload file.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error uploading file.");
    } finally {
      if (field === "logo") setUploadingLogo(false);
      else setUploadingBanner(false);
      event.target.value = "";
    }
  };

  const removeImage = async (field: "logo" | "banner", currentUrl: string) => {
    if (currentUrl && currentUrl.includes("/uploads/")) {
      try {
        await fetch(`/api/upload?fileUrl=${encodeURIComponent(currentUrl)}`, {
          method: "DELETE",
        });
        toast.success("Image removed successfully");
      } catch (err) {
        console.error("Failed to delete file", err);
        toast.error("Failed to remove image");
      }
    } else {
      toast.success("Image removed successfully");
    }
    handleChange(field, "");
  };

  const handleRemoveClick = (field: "logo" | "banner") => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to remove this image.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        removeImage(field, formData[field] || "");
      }
    });
  };

  useEffect(() => {
    if (isEdit && eventId && events.length > 0) {
      const found = events.find((e) => (e._id || e.id) === eventId);
      if (found) {
        setFormData(found);
      }
      dispatch(fetchTickets(eventId));
    }
    if (!ticketGroups || ticketGroups.length === 0) {
      dispatch(fetchTicketGroups());
    }
  }, [isEdit, eventId, events, dispatch]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      dispatch(clearEventError());
    }
  }, [error, dispatch]);

  // Auto-hide alert messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleChange = (field: keyof EventRecord, value: any) => {
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title") {
        updated.slug = value
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[\s_]+/g, "-")
          .replace(/[^\w-]+/g, "")
          .replace(/--+/g, "-");
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const payload = { ...formData } as any;
      // Prevent Mongoose CastError on empty strings for ObjectIds
      if (!payload.organizerId) delete payload.organizerId;
      // Prevent Mongoose CastError on empty strings for Numbers
      if (payload.maximumSeats === "") payload.maximumSeats = null;

      if (isEdit) {
        // Redux will use payload._id or payload.id to build the URL, then omit it from the body
        await dispatch(updateEvent(payload)).unwrap();
      } else {
        await dispatch(addEvent(payload)).unwrap();
      }
      sessionStorage.setItem(
        "eventSuccessMsg",
        `Event "${formData.title}" ${isEdit ? "updated" : "created"} successfully!`
      );
      router.push("/admin/events");
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          errors[e.field] = e.message;
        });
        setFieldErrors(errors);
        setErrorMessage("Please fill all required fields.");
        setTimeout(() => {
          const firstErrorField = err.errors[0]?.field;
          if (firstErrorField) {
            const element = document.getElementById(firstErrorField);
            if (element) element.focus();
          }
        }, 100);
      } else {
        setErrorMessage(err.message || "An error occurred");
      }
    }
  };

  return (
    <>
      <PageBreadcrumb
        title={isEdit ? `Edit (${formData.title || eventId})` : "Add New"}
        subtitle="Events"
      />

      {errorMessage && (
        <Alert
          variant="danger"
          className="d-flex align-items-center gap-2 mb-3"
          onClose={() => setErrorMessage("")}
          dismissible
        >
          <Icon icon="alert-circle" className="fs-18 flex-shrink-0" />
          <span>{errorMessage}</span>
        </Alert>
      )}

      <Row className="justify-content-center">
        <Col lg={12}>
          <form onSubmit={handleSubmit}>
            <Card className="mb-4 border-0 shadow-sm">
              {/* <CardHeader className="bg-light-subtle py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-2 d-flex align-items-center justify-content-center">
                    <Icon icon={isEdit ? "edit-3" : "calendar"} className="fs-20" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{isEdit ? "Update Event Details" : "Event Setup"}</h5>
                    <small className="text-muted">Configure event information</small>
                  </div>
                </div>
              </CardHeader> */}
              <CardBody className="p-4">
                <Row className="g-4">
                  <Col md={12}>
                    <FormLabel className="fw-semibold">Event Title <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      id="title"
                      type="text"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      
                      isInvalid={!!fieldErrors.title}
                    />
                    {fieldErrors.title && <div className="text-danger small mt-1">{fieldErrors.title}</div>}
                  </Col>

                  <Col md={3}>
                    <FormLabel className="fw-semibold">Start Date <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      id="startDate"
                      type="date"
                      value={formData.startDate ? formData.startDate.split("T")[0] : ""}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      
                      isInvalid={!!fieldErrors.startDate}
                    />
                    {fieldErrors.startDate && <div className="text-danger small mt-1">{fieldErrors.startDate}</div>}
                  </Col>
                  <Col md={3}>
                    <FormLabel className="fw-semibold">End Date <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      id="endDate"
                      type="date"
                      value={formData.endDate ? formData.endDate.split("T")[0] : ""}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      
                      isInvalid={!!fieldErrors.endDate}
                    />
                    {fieldErrors.endDate && <div className="text-danger small mt-1">{fieldErrors.endDate}</div>}
                  </Col>

                  <Col md={3}>
                    <FormLabel className="fw-semibold">Reg. Open <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      id="registrationOpen"
                      type="date"
                      value={formData.registrationOpen ? (formData.registrationOpen as string).split("T")[0] : ""}
                      onChange={(e) => handleChange("registrationOpen", e.target.value)}
                      
                      isInvalid={!!fieldErrors.registrationOpen}
                    />
                    {fieldErrors.registrationOpen && <div className="text-danger small mt-1">{fieldErrors.registrationOpen}</div>}
                  </Col>
                  
                  <Col md={3}>
                    <FormLabel className="fw-semibold">Reg. Close <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      id="registrationClose"
                      type="date"
                      value={formData.registrationClose ? (formData.registrationClose as string).split("T")[0] : ""}
                      onChange={(e) => handleChange("registrationClose", e.target.value)}
                      
                      isInvalid={!!fieldErrors.registrationClose}
                    />
                    {fieldErrors.registrationClose && <div className="text-danger small mt-1">{fieldErrors.registrationClose}</div>}
                  </Col>

                  <Col md={3}>
                    <FormLabel className="fw-semibold">Start Time <span className="text-danger">*</span></FormLabel>
                    <Select
                      id="startTime"
                      options={timeOptions}
                      value={timeOptions.find((o) => o.value === formData.startTime) || null}
                      onChange={(selected: any) => handleChange("startTime", selected ? selected.value : "")}
                      placeholder="10:00 AM"
                      isClearable
                    />
                    {fieldErrors.startTime && <div className="text-danger small mt-1">{fieldErrors.startTime}</div>}
                  </Col>
                  <Col md={3}>
                    <FormLabel className="fw-semibold">End Time <span className="text-danger">*</span></FormLabel>
                    <Select
                      id="endTime"
                      options={timeOptions}
                      value={timeOptions.find((o) => o.value === formData.endTime) || null}
                      onChange={(selected: any) => handleChange("endTime", selected ? selected.value : "")}
                      placeholder="06:00 PM"
                      isClearable
                    />
                    {fieldErrors.endTime && <div className="text-danger small mt-1">{fieldErrors.endTime}</div>}
                  </Col>
                  <Col md={3}>
                    <FormLabel className="fw-semibold">Status <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value as any)}
                      isInvalid={!!fieldErrors.status}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Expired">Expired</option>
                    </FormSelect>
                    {fieldErrors.status && <div className="text-danger small mt-1">{fieldErrors.status}</div>}
                  </Col>
                  
                  <Col md={3}>
                    <FormLabel className="fw-semibold">Event Type <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => handleChange("eventType", e.target.value as any)}
                      isInvalid={!!fieldErrors.eventType}
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </FormSelect>
                    {fieldErrors.eventType && <div className="text-danger small mt-1">{fieldErrors.eventType}</div>}
                  </Col>

                  {(formData.eventType === "Offline" || formData.eventType === "Hybrid") && (
                    <Col md={formData.eventType === "Hybrid" ? 6 : 12}>
                      <FormLabel className="fw-semibold">Venue Location</FormLabel>
                      <FormControl
                        id="venueLocation"
                        type="text"
                        placeholder="Enter physical address"
                        value={formData.venueLocation || ""}
                        onChange={(e) => handleChange("venueLocation", e.target.value)}
                        isInvalid={!!fieldErrors.venueLocation}
                      />
                      {fieldErrors.venueLocation && <div className="text-danger small mt-1">{fieldErrors.venueLocation}</div>}
                    </Col>
                  )}

                  {(formData.eventType === "Online" || formData.eventType === "Hybrid") && (
                    <Col md={formData.eventType === "Hybrid" ? 6 : 12}>
                      <FormLabel className="fw-semibold">Online Platform URL</FormLabel>
                      <FormControl
                        id="onlinePlatformUrl"
                        type="url"
                        placeholder="e.g. Zoom/Meet link"
                        value={formData.onlinePlatformUrl || ""}
                        onChange={(e) => handleChange("onlinePlatformUrl", e.target.value)}
                        isInvalid={!!fieldErrors.onlinePlatformUrl}
                      />
                      {fieldErrors.onlinePlatformUrl && <div className="text-danger small mt-1">{fieldErrors.onlinePlatformUrl}</div>}
                    </Col>
                  )}

                  <Col md={4}>
                    <FormLabel className="fw-semibold">Logo Image <span className="text-muted small fw-normal">(Images only, Max 2MB)</span></FormLabel>
                    <InputGroup className="mb-2">
                      <label className={`btn btn-light border d-flex align-items-center bg-light text-nowrap m-0 ${uploadingLogo ? 'disabled' : ''}`} style={{ cursor: "pointer" }}>
                        <Icon icon="upload" className="fs-16 me-2 text-danger"/> Choose File
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          hidden
                          onChange={(e: any) => handleFileUpload("logo", e)}
                          disabled={uploadingLogo}
                        />
                      </label>
                      <FormControl
                        readOnly
                        placeholder={uploadingLogo ? "Uploading..." : "No file chosen"}
                        value={formData.logo || ""}
                        isInvalid={!!fieldErrors.logo}
                        className="bg-light"
                      />
                    </InputGroup>
                    {formData.logo && (
                      <div className="mt-2 position-relative d-inline-block">
                        <Image src={formData.logo} alt="Logo Preview" width={100} height={80} style={{ objectFit: "contain", borderRadius: "4px", maxHeight: "80px" }} unoptimized />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 start-100 translate-middle rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "24px", height: "24px" }}
                          onClick={() => handleRemoveClick("logo")}
                          title="Remove Image"
                        >
                          <Icon icon="x" className="fs-14" />
                        </Button>
                      </div>
                    )}
                    {fieldErrors.logo && <div className="text-danger small mt-1">{fieldErrors.logo}</div>}
                  </Col>

                  <Col md={4}>
                    <FormLabel className="fw-semibold">Banner Image <span className="text-muted small fw-normal">(Images only, Max 2MB)</span></FormLabel>
                    <InputGroup className="mb-2">
                      <label className={`btn btn-light border d-flex align-items-center bg-light text-nowrap m-0 ${uploadingBanner ? 'disabled' : ''}`} style={{ cursor: "pointer" }}>
                        <Icon icon="upload" className="fs-16 me-2 text-danger"/> Choose File
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          hidden
                          onChange={(e: any) => handleFileUpload("banner", e)}
                          disabled={uploadingBanner}
                        />
                      </label>
                      <FormControl
                        readOnly
                        placeholder={uploadingBanner ? "Uploading..." : "No file chosen"}
                        value={formData.banner || ""}
                        isInvalid={!!fieldErrors.banner}
                        className="bg-light"
                      />
                    </InputGroup>
                    {formData.banner && (
                      <div className="mt-2 position-relative d-inline-block">
                        <Image src={formData.banner} alt="Banner Preview" width={200} height={80} style={{ objectFit: "contain", borderRadius: "4px", maxHeight: "80px" }} unoptimized />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 start-100 translate-middle rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "24px", height: "24px" }}
                          onClick={() => handleRemoveClick("banner")}
                          title="Remove Image"
                        >
                          <Icon icon="x" className="fs-14" />
                        </Button>
                      </div>
                    )}
                    {fieldErrors.banner && <div className="text-danger small mt-1">{fieldErrors.banner}</div>}
                  </Col>

                  <Col md={2}>
                    <FormLabel className="fw-semibold">Maximum Seats</FormLabel>
                    <FormControl
                      id="maximumSeats"
                      type="number"
                      placeholder="e.g. 100"
                      value={formData.maximumSeats === undefined ? "" : formData.maximumSeats}
                      onChange={(e) => handleChange("maximumSeats", e.target.value ? parseInt(e.target.value) : "")}
                      isInvalid={!!fieldErrors.maximumSeats}
                    />
                    {fieldErrors.maximumSeats && <div className="text-danger small mt-1">{fieldErrors.maximumSeats}</div>}
                  </Col>

                  <Col md={2}>
                    <FormLabel className="fw-semibold d-block">Is Active</FormLabel>
                    <FormCheck
                      id="isActive"
                      type="switch"
                      label={formData.isActive ? "Active" : "Inactive"}
                      checked={!!formData.isActive}
                      onChange={(e) => handleChange("isActive", e.target.checked)}
                      isInvalid={!!fieldErrors.isActive}
                      className="mt-2"
                    />
                    {fieldErrors.isActive && <div className="text-danger small mt-1">{fieldErrors.isActive}</div>}
                  </Col>

                  <Col md={12}>
                    <FormLabel className="fw-semibold">Description</FormLabel>
                    <div className="bg-white">
                      <Editor
                        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.3.0/tinymce.min.js"
                        value={formData.description || ""}
                        onEditorChange={(newValue) => handleChange("description", newValue)}
                        init={{
                          height: 300,
                          menubar: false,
                          statusbar: false,
                          plugins: [
                            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                            "insertdatetime", "media", "table", "code", "help", "wordcount"
                          ],
                          toolbar: "undo redo | formatselect | " +
                          "bold italic underline strikethrough | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "table link image | removeformat",
                          content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
                        }}
                      />
                      {fieldErrors.description && <div className="text-danger small mt-1">{fieldErrors.description}</div>}
                    </div>
                  </Col>
                  
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <Button
                    variant="light"
                    type="button"
                    onClick={() => router.push("/admin/events")}
                  >
                    Cancel
                  </Button>
                  {canWrite && (
                    <Button variant="primary" type="submit" disabled={loading} className="position-relative">
                      {loading && (
                        <span 
                          className="spinner-border spinner-border-sm position-absolute top-50 start-50 translate-middle" 
                          role="status" 
                          aria-hidden="true"
                        ></span>
                      )}
                      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
                        {isEdit ? "Update Event" : "Create Event"}
                      </span>
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </form>

          {isEdit && eventId && (
            <Card className="shadow-sm border-0 mt-4">
              <CardHeader className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark fw-bold">Annual Conference Pass and Pricing</h5>
                {canWrite && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(null);
                      setShowTicketModal(true);
                    }}
                  >
                    <Icon icon="plus" className="me-1" /> Add New Ticket
                  </Button>
                )}
              </CardHeader>
              <CardBody>
                {ticketsLoading ? (
                  <div className="text-center py-4 text-muted">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-4 text-muted">No tickets configured for this event yet.</div>
                ) : (
                  <Row className="g-3">
                    {tickets.map(ticket => (
                      <Col md={6} lg={4} key={ticket.id || ticket._id}>
                        <Card className="h-80 shadow-sm border rounded-3">
                          <CardBody className="p-3 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="fw-semibold mb-0 text-dark fs-6">
                                {ticket.ticketName}
                                {ticket.groupId && ticketGroups && ticketGroups.find((g: any) => g._id === ticket.groupId) && (
                                  <span className="ms-2 badge bg-primary text-white" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>
                                    {ticketGroups.find((g: any) => g._id === ticket.groupId)?.name}
                                  </span>
                                )}
                              </h5>
                              <div className="d-flex align-items-center gap-2">
                                <Form.Check
                                  type="switch"
                                  id={`switch-${ticket.id || ticket._id}`}
                                  checked={ticket.isActive}
                                  onChange={() => handleToggleTicketActive(ticket)}
                                  className="fs-5 m-0"
                                  disabled={!canWrite}
                                />
                                {canWrite && (
                                  <Dropdown align="end">
                                    <Dropdown.Toggle variant="light" size="sm" className="bg-transparent border-secondary text-secondary p-1 d-flex align-items-center rounded-2" style={{ boxShadow: 'none' }}>
                                      <Icon icon="more-horizontal" className="fs-18" />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="shadow-sm border-0 py-2">
                                      <Dropdown.Item onClick={() => handleEditTicket(ticket)} className="d-flex align-items-center gap-2 py-2">
                                        <Icon icon="edit-2" className="fs-16 text-secondary" /> Edit
                                      </Dropdown.Item>
                                      <Dropdown.Item onClick={() => handleCloneTicket(ticket)} className="d-flex align-items-center gap-2 py-2">
                                        <Icon icon="copy" className="fs-16 text-secondary" /> Clone
                                      </Dropdown.Item>
                                      <Dropdown.Item onClick={() => handleDeleteTicket((ticket._id || ticket.id) as string)} className="d-flex align-items-center gap-2 py-2 text-danger">
                                        <Icon icon="trash-2" className="fs-16" /> Delete
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                )}
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <h3 className="fw-bold mb-0 text-dark">₹{ticket.ticketPrice.toFixed(2)}</h3>
                            </div>

                            <div className="d-flex justify-content-between text-muted small fw-medium mt-auto pb-3">
                              <span>Minimum Qty - {ticket.minQuantity || 'N/A'}</span>
                              <span>Maximum Qty - {ticket.maxQuantity || 'N/A'}</span>
                            </div>
                          </CardBody>
                          <div className="bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center rounded-bottom">
                            <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
                              <span className={`rounded-circle bg-${ticket.isActive ? 'success' : 'secondary'}`} style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
                              {ticket.endDate ? `Sale will end on ${new Date(ticket.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "No end date set"}
                            </div>
                            <div className="text-secondary small fw-semibold">
                              0 / {ticket.numberOfTickets} sold
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </CardBody>
            </Card>
          )}

          {isEdit && eventId && (
            <TicketModal
              show={showTicketModal}
              onHide={() => setShowTicketModal(false)}
              eventId={eventId}
              existingTicket={selectedTicket}
              eventDefaults={{
                startDate: formData.registrationOpen,
                endDate: formData.registrationClose,
                startTime: formData.startTime,
                endTime: formData.endTime
              }}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default EventForm;
