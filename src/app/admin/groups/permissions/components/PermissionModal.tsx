"use client";
import Icon from "@/components/wrappers/Icon";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  FormCheck,
  FormControl,
  FormLabel,
  FormSelect,
  Modal,
  Row,
} from "react-bootstrap";
import { ManagementType } from "./data";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchGroups } from "@/redux/slices/admin/groupSlice";

interface PermissionModalProps {
  show: boolean;
  onHide: () => void;
  permission: ManagementType | null;
  onSave: (record: ManagementType) => Promise<void>;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  show,
  onHide,
  permission,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const { groups } = useAppSelector((state) => state.groups);
  const { permissions } = useAppSelector((state) => state.permissions);

  const dynamicRoles = groups.map((g, idx) => {
    const classNames = [
      "bg-primary-subtle text-primary",
      "bg-danger-subtle text-danger",
      "bg-info-subtle text-info",
      "bg-secondary-subtle text-secondary",
      "bg-warning-subtle text-warning",
      "bg-success-subtle text-success",
    ];
    return {
      groupId: g.id,
      label: g.name,
      className: classNames[idx % classNames.length],
    };
  });

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Management");
  const [url, setUrl] = useState("");
  const [iconName, setIconName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [usersCount, setUsersCount] = useState<number>(1);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (groups.length === 0) {
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  useEffect(() => {
    setApiError(null);
    if (permission) {
      setName(permission.name);
      setCategory(permission.category || "Management");
      setUrl(permission.url || "");
      setIconName(permission.icon || "");
      setSelectedRoles(permission.roles.map((r: any) => r.groupId));
    } else {
      setName("");
      setCategory("Management");
      setUrl("");
      setIconName("");
      const superAdminGrp = groups.find((g) => g.id === "GRP-1");
      setSelectedRoles(
        [superAdminGrp?.id].filter(Boolean) as string[],
      );
      setUsersCount(1);
    }
  }, [permission, show]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId],
    );
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (apiError) setApiError(null);

    if (!permission) {
      const lower = val.toLowerCase();
      // Auto-suggest icon
      if (lower.includes('user') || lower.includes('group') || lower.includes('role') || lower.includes('member')) {
        setIconName('users');
      } else if (lower.includes('setting') || lower.includes('config') || lower.includes('system')) {
        setIconName('settings');
      } else if (lower.includes('dashboard') || lower.includes('home')) {
        setIconName('layout-dashboard');
      } else if (lower.includes('invoice') || lower.includes('billing') || lower.includes('payment')) {
        setIconName('file-text');
      } else if (lower.includes('permission') || lower.includes('access') || lower.includes('security')) {
        setIconName('shield');
      } else if (lower.includes('report') || lower.includes('analytic')) {
        setIconName('bar-chart');
      } else if (lower.includes('mail') || lower.includes('message') || lower.includes('chat')) {
        setIconName('mail');
      } else {
        setIconName('file-text');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      setApiError("Module / Resource Name is required");
      return;
    }
    setApiError(null);

    const now = new Date();
    const record: ManagementType = {
      ...(permission?.id ? { id: permission.id } : {}),
      name: name.trim(),
      category: category,
      url: url.trim(),
      icon: iconName.trim(),
      roles: dynamicRoles
        .filter((r) => selectedRoles.includes(r.groupId))
        .map((r) => ({ groupId: r.groupId, label: r.label, className: r.className })),
      date:
        permission?.date ||
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      time:
        permission?.time ||
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      users: usersCount,
    };

    try {
      await onSave(record);
      onHide();
    } catch (err: any) {
      // API error handled by Swal in the parent component
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-16 d-flex align-items-center gap-2">
            <Icon icon="key" className="text-primary" />
            {permission ? "Edit Permission Setting" : "Add New Permission"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <div className="mb-3">
            <FormLabel className="fw-semibold">
              Permission / Module Name <span className="text-danger">*</span>
            </FormLabel>
            <FormControl
              type="text"
              placeholder="e.g. Users"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={apiError ? "is-invalid" : ""}
            />
            {apiError && (
              <div className="text-danger mt-1 fs-13">{apiError}</div>
            )}
          </div>

          <div className="mb-3">
            <FormLabel className="fw-semibold">Category</FormLabel>
            <FormSelect
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Main">Main</option>
              <option value="Administration">Administration</option>
              <option value="Management">Management</option>
              <option value="Application">Application</option>
            </FormSelect>
          </div>

          <Row className="mb-3">
            <Col md={6}>
              <FormLabel className="fw-semibold">Menu URL (Optional)</FormLabel>
              <FormControl
                type="text"
                placeholder="e.g. /admin/users"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <FormLabel className="fw-semibold">
                Menu Icon {" "}
                <a 
                  href="https://lucide.dev/icons" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="fs-12 ms-1 fw-normal text-decoration-underline"
                >
                  (View Icons)
                </a>
              </FormLabel>
              <div className="d-flex gap-2 align-items-center">
                <FormControl
                  type="text"
                  placeholder="e.g.file-text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                />
                {iconName && <Icon icon={iconName} className="fs-18 text-secondary" />}
              </div>
            </Col>
          </Row>

          <div className="mb-3">
            <FormLabel className="fw-semibold mb-2">
              Assign Authorized Groups
            </FormLabel>
            <Row className="g-2">
              {dynamicRoles.map((role, idx) => (
                <Col xs={6} key={idx}>
                  <FormCheck
                    type="checkbox"
                    id={`role-check-${idx}`}
                    label={role.label}
                    checked={selectedRoles.includes(role.groupId)}
                    onChange={() => handleRoleToggle(role.groupId)}
                  />
                </Col>
              ))}
            </Row>
          </div>

          <div className="mb-3">
            <FormLabel className="fw-semibold">
              Estimated Active Users
            </FormLabel>
            <FormControl
              type="number"
              min={1}
              max={999}
              value={usersCount}
              onChange={(e) => setUsersCount(Number(e.target.value))}
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light-subtle">
          <Button variant="light" type="button" onClick={onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="d-flex align-items-center gap-1"
          >
            <Icon icon="check" />
            {permission ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PermissionModal;
