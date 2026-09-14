"use client";
import Icon from "@/components/wrappers/Icon";
import React, { useState, useEffect } from "react";
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
import Select from "react-select";
import { PermissionModuleAccess } from "@/app/admin/dataStore";

interface AccessRuleModalProps {
  show: boolean;
  onHide: () => void;
  rule: PermissionModuleAccess | null;
  onSave: (rule: PermissionModuleAccess) => Promise<string | void> | void;
  nextId?: string;
  availableModules?: string[];
}

const AccessRuleModal: React.FC<AccessRuleModalProps> = ({
  show,
  onHide,
  rule,
  onSave,
  nextId,
  availableModules = [],
}) => {
  const [moduleName, setModuleName] = useState(rule?.moduleName || "");
  const [category, setCategory] = useState(rule?.category || "Management");
  const [read, setRead] = useState(rule?.read ?? true);
  const [write, setWrite] = useState(rule?.write ?? false);
  const [del, setDel] = useState(rule?.delete ?? false);
  const [exp, setExp] = useState(rule?.export ?? false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setModuleName(rule?.moduleName || "");
      setCategory(rule?.category || "Management");
      setRead(rule?.read ?? true);
      setWrite(rule?.write ?? false);
      setDel(rule?.delete ?? false);
      setExp(rule?.export ?? false);
      setErrorMsg(null);
    }
  }, [rule, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleName) {
      setErrorMsg("Module / Resource Name is required.");
      return;
    }

    setErrorMsg(null);
    setSaving(true);

    const newRule: PermissionModuleAccess = {
      id: rule?.id || nextId || `MOD-${Math.floor(10 + Math.random() * 89)}`,
      moduleName,
      category,
      read,
      write,
      delete: del,
      export: exp,
    };

    const error = await onSave(newRule);
    setSaving(false);

    if (error) {
      setErrorMsg(error);
    } else {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-16 d-flex align-items-center gap-2">
            <Icon icon="key" className="text-primary" />
            {rule ? `Edit Access: ${rule.moduleName}` : "Add New Access"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col xs={12}>
              <FormLabel>
                Module / Resource Name <span className="text-danger">*</span>
              </FormLabel>
              {availableModules.length > 0 ? (
                <Select
                  options={availableModules.map((modName) => ({
                    value: modName,
                    label: modName,
                  }))}
                  value={
                    moduleName ? { value: moduleName, label: moduleName } : null
                  }
                  onChange={(selected: any) => {
                    setModuleName(selected?.value || "");
                    if (selected?.value) setErrorMsg(null);
                  }}
                  placeholder="Select Resource..."
                  isSearchable
                  isClearable
                  classNamePrefix="react-select"
                />
              ) : (
                <FormControl
                  type="text"
                  placeholder="e.g. API Gateway Keys"
                  required
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                />
              )}
              {errorMsg && (
                <div className="text-danger mt-1 fs-13 fw-medium">
                  {errorMsg}
                </div>
              )}
            </Col>
            <Col xs={12}>
              <FormLabel>Category</FormLabel>
              <FormSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Main">Main</option>
                <option value="Administration">Administration</option>
                <option value="Management">Management</option>
                <option value="Application">Application</option>
              </FormSelect>
            </Col>

            <Col xs={12}>
              <FormLabel className="fw-semibold mt-2">
                Allowed Actions
              </FormLabel>
              <div className="d-flex flex-wrap gap-4 p-3 bg-light rounded border">
                <FormCheck
                  type="checkbox"
                  id="rule-read"
                  label="View"
                  checked={read}
                  onChange={(e) => setRead(e.target.checked)}
                />
                <FormCheck
                  type="checkbox"
                  id="rule-write"
                  label="Create"
                  checked={write}
                  onChange={(e) => setWrite(e.target.checked)}
                />
                <FormCheck
                  type="checkbox"
                  id="rule-delete"
                  label="Delete"
                  checked={del}
                  onChange={(e) => setDel(e.target.checked)}
                />
                <FormCheck
                  type="checkbox"
                  id="rule-export"
                  label="Export"
                  checked={exp}
                  onChange={(e) => setExp(e.target.checked)}
                />
              </div>
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
            disabled={saving}
          >
            <Icon icon="save" />
            {saving ? "Saving..." : rule ? "Save Rule" : "Add Rule"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AccessRuleModal;
