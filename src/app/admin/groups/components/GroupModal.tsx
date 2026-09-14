"use client";
import Icon from "@/components/wrappers/Icon";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  FormControl,
  FormLabel,
  FormSelect,
  Modal,
  Row,
} from "react-bootstrap";
import { UserGroupRecord } from "@/app/admin/dataStore";

interface GroupModalProps {
  show: boolean;
  onHide: () => void;
  group: UserGroupRecord | null;
  onSave: (group: UserGroupRecord) => void;
}

const GroupModal: React.FC<GroupModalProps> = ({
  show,
  onHide,
  group,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<UserGroupRecord>>({
    name: "",
    description: "",
    badgeVariant: "primary",
    status: "Active",
  });

  useEffect(() => {
    if (group) {
      setFormData(group);
    } else {
      setFormData({
        name: "",
        description: "",
        badgeVariant: "primary",
        status: "Active",
      });
    }
  }, [group, show]);

  const handleChange = (field: keyof UserGroupRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const record: UserGroupRecord = {
      id: group?.id || "",
      name: formData.name || "",
      description: formData.description || "",
      badgeVariant: formData.badgeVariant || "primary",
      memberCount: group?.memberCount ?? 0,
      status: formData.status || "Active",
      createdDate:
        group?.createdDate ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      permissionsCount: group?.permissionsCount ?? 0,
    };

    onSave(record);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-16 d-flex align-items-center gap-2">
            <Icon
              icon={group ? "shield" : "plus-circle"}
              className="text-primary"
            />
            {group ? `Edit Group: ${group.name}` : "Add Group"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col xs={12}>
              <FormLabel>
                Group Name <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="text"
                placeholder="e.g. Group Name"
                required
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Col>
            <Col xs={12}>
              <FormLabel>Description</FormLabel>
              <FormControl
                as="textarea"
                rows={3}
                placeholder="Describe this group..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Col>
            <Col md={6}>
              <FormLabel>Badge Theme Color</FormLabel>
              <FormSelect
                value={formData.badgeVariant || "primary"}
                onChange={(e) =>
                  handleChange("badgeVariant", e.target.value as any)
                }
              >
                <option value="primary">Primary (Blue)</option>
                <option value="success">Success (Green)</option>
                <option value="info">Info (Cyan)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="danger">Danger (Red)</option>
                <option value="secondary">Secondary (Gray)</option>
              </FormSelect>
            </Col>
            <Col md={6}>
              <FormLabel>Status</FormLabel>
              <FormSelect
                value={formData.status || "Active"}
                onChange={(e) => handleChange("status", e.target.value as any)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </FormSelect>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="light" onClick={onHide} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="d-flex align-items-center gap-1"
          >
            <Icon icon="save" />
            {group ? "Save Group" : "Create Group"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default GroupModal;
