import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "@/components/wrappers/Select";
import { useDispatch, useSelector } from "react-redux";
import { addTicket, updateTicket, fetchTicketGroups, Ticket } from "@/redux/slices/admin/ticketSlice";
import { AppDispatch, RootState } from "@/redux/store";
import toast from "react-hot-toast";


interface TicketModalProps {
  show: boolean;
  onHide: () => void;
  eventId: string;
  existingTicket?: Ticket | null;
  eventDefaults: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  };
}

const TicketModal: React.FC<TicketModalProps> = ({ show, onHide, eventId, existingTicket, eventDefaults }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const ticketGroups = useSelector((state: RootState) => (state as any).tickets?.ticketGroups || []);

  useEffect(() => {
    if (show && ticketGroups.length === 0) {
      dispatch(fetchTicketGroups());
    }
  }, [show, dispatch, ticketGroups.length]);


  const [formData, setFormData] = useState<Partial<Ticket>>({
    ticketName: "",
    groupId: null,
    numberOfTickets: "" as any,
    ticketPrice: "" as any,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    minQuantity: 1,
    maxQuantity: 10,
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeOptions = useMemo(() => {
    const times = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 24 * 60; i += 5) {
      const timeString = start.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      times.push({ value: timeString, label: timeString });
      start.setMinutes(start.getMinutes() + 5);
    }
    return times;
  }, []);

  useEffect(() => {
    if (show) {
      if (existingTicket) {
        setFormData({
          ticketName: existingTicket.ticketName,
          groupId: existingTicket.groupId || null,
          numberOfTickets: existingTicket.numberOfTickets,
          ticketPrice: existingTicket.ticketPrice,
          startDate: existingTicket.startDate ? new Date(existingTicket.startDate).toISOString().split('T')[0] : "",
          endDate: existingTicket.endDate ? new Date(existingTicket.endDate).toISOString().split('T')[0] : "",
          startTime: existingTicket.startTime || "",
          endTime: existingTicket.endTime || "",
          minQuantity: existingTicket.minQuantity,
          maxQuantity: existingTicket.maxQuantity,
          description: existingTicket.description || "",
          isActive: existingTicket.isActive,
        });
      } else {
        setFormData({
          ticketName: "",
          groupId: null,
          numberOfTickets: "" as any,
          ticketPrice: "" as any,
          startDate: eventDefaults.startDate ? new Date(eventDefaults.startDate).toISOString().split('T')[0] : "",
          endDate: eventDefaults.endDate ? new Date(eventDefaults.endDate).toISOString().split('T')[0] : "",
          startTime: eventDefaults.startTime || "",
          endTime: eventDefaults.endTime || "",
          minQuantity: 1,
          maxQuantity: 10,
          description: "",
          isActive: true,
        });
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, existingTicket]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string; type?: string } }) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? (value === "" ? "" : Number(value)) : value)
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.ticketName?.trim()) newErrors.ticketName = "Ticket Name is required";
    if (formData.numberOfTickets === ("" as any) || !formData.numberOfTickets || formData.numberOfTickets < 1) newErrors.numberOfTickets = "Quantity must be at least 1";
    if (formData.ticketPrice === ("" as any) || formData.ticketPrice === undefined || formData.ticketPrice < 0) newErrors.ticketPrice = "Price cannot be empty or negative (enter 0 for free)";
    if (!formData.minQuantity || formData.minQuantity < 1) newErrors.minQuantity = "Min quantity must be at least 1";
    if (!formData.maxQuantity || formData.maxQuantity < (formData.minQuantity || 1)) newErrors.maxQuantity = "Max quantity must be >= min quantity";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const isClone = existingTicket && !(existingTicket._id || existingTicket.id);
      
      if (existingTicket && !isClone) {
        await dispatch(updateTicket({ 
          eventId, 
          ticketId: existingTicket._id || existingTicket.id as string, 
          ticketData: formData 
        })).unwrap();
        toast.success("Ticket updated successfully");
      } else {
        await dispatch(addTicket({ 
          eventId, 
          ticketData: { ...formData, eventId } as Ticket 
        })).unwrap();
        toast.success("Ticket added successfully");
      }
      onHide();
    } catch (err: any) {
      toast.error(err || "Failed to save ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{existingTicket ? "Edit Ticket" : "Add New Ticket"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Label>Ticket Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="ticketName"
                value={formData.ticketName || ""}
                onChange={handleChange}
                isInvalid={!!errors.ticketName}
                placeholder="Enter Ticket Name"
              />
              <Form.Control.Feedback type="invalid">{errors.ticketName}</Form.Control.Feedback>
            </Col>
            
            <Col md={4}>
              <Form.Label>Ticket Group</Form.Label>
              <Form.Select
                name="groupId"
                value={formData.groupId || ""}
                onChange={handleChange}
              >
                <option value="">None</option>
                {ticketGroups.map((g: any) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={6}>
              <Form.Label>No of Tickets <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="numberOfTickets"
                value={formData.numberOfTickets || ""}
                onChange={handleChange}
                isInvalid={!!errors.numberOfTickets}
                min={1}
              />
              <Form.Control.Feedback type="invalid">{errors.numberOfTickets}</Form.Control.Feedback>
            </Col>
            
            <Col md={6}>
              <Form.Label>Ticket Price <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice === undefined ? "" : formData.ticketPrice}
                onChange={handleChange}
                isInvalid={!!errors.ticketPrice}
                min={0}
                step="0.01"
              />
              <Form.Control.Feedback type="invalid">{errors.ticketPrice}</Form.Control.Feedback>
              <Form.Text className="text-muted">Set to 0 for free tickets</Form.Text>
            </Col>
            
            <Col md={6}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleChange}
              />
            </Col>
            
            <Col md={6}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleChange}
              />
            </Col>
            
            <Col md={6}>
              <Form.Label>Start Time</Form.Label>
              <Select
                id="startTime"
                options={timeOptions}
                value={timeOptions.find((o) => o.value === formData.startTime) || null}
                onChange={(selected: any) => handleChange({ target: { name: "startTime", value: selected ? selected.value : "" } })}
                placeholder="10:00 AM"
                isClearable
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({ ...base, padding: "2px" })
                }}
              />
            </Col>
            
            <Col md={6}>
              <Form.Label>End Time</Form.Label>
              <Select
                id="endTime"
                options={timeOptions}
                value={timeOptions.find((o) => o.value === formData.endTime) || null}
                onChange={(selected: any) => handleChange({ target: { name: "endTime", value: selected ? selected.value : "" } })}
                placeholder="11:00 AM"
                isClearable
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({ ...base, padding: "2px" })
                }}
              />
            </Col>
            
            <Col md={6}>
              <Form.Label>Minimum Quantity</Form.Label>
              <Form.Control
                type="number"
                name="minQuantity"
                value={formData.minQuantity || ""}
                onChange={handleChange}
                isInvalid={!!errors.minQuantity}
                min={1}
              />
              <Form.Control.Feedback type="invalid">{errors.minQuantity}</Form.Control.Feedback>
            </Col>
            
            <Col md={6}>
              <Form.Label>Maximum Quantity</Form.Label>
              <Form.Control
                type="number"
                name="maxQuantity"
                value={formData.maxQuantity || ""}
                onChange={handleChange}
                isInvalid={!!errors.maxQuantity}
                min={1}
              />
              <Form.Control.Feedback type="invalid">{errors.maxQuantity}</Form.Control.Feedback>
            </Col>
            
            <Col md={12}>
              <Form.Label>Ticket Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Details about what this ticket includes..."
              />
            </Col>
            
            <Col md={12}>
              <Form.Check
                type="switch"
                id="isActive-switch"
                label="Ticket Active"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Ticket"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TicketModal;
