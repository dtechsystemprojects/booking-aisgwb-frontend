"use client";
import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormCheck,
  FormSelect,
  OverlayTrigger,
  Row,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { PermissionModuleAccess } from "@/app/admin/dataStore";
import AccessRuleModal from "./AccessRuleModal";
import Swal from "sweetalert2";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGroupAccessRules,
  addGroupAccessRule,
  updateGroupAccessRule,
  bulkSaveGroupAccessRules,
  deleteGroupAccessRule,
  clearGroupAccessError,
  setModulesOptimistic,
} from "@/redux/slices/admin/groupAccessSlice";
import { fetchGroups } from "@/redux/slices/admin/groupSlice";
import { fetchPermissions } from "@/redux/slices/admin/permissionSlice";
import { checkAuth } from "@/redux/slices/authSlice";
import { usePageAccess, useAccess } from "@/hooks/useAccess";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const GroupAccessContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { modules, loading, error } = useAppSelector(
    (state) => state.groupAccess,
  );
  const { groups } = useAppSelector((state) => state.groups);
  const { permissions } = useAppSelector((state) => state.permissions);
  const searchParams = useSearchParams();
  const queryGroupId = searchParams.get("groupId");
  const initialized = useRef(false);

  const { write: canWrite, delete: canDelete } = usePageAccess("Group Access");
  const { read: canReadPermissions } = useAccess("Permissions");

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] =
    useState<PermissionModuleAccess | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (groups.length > 0 && !initialized.current) {
      if (queryGroupId && groups.some((g) => g.id === queryGroupId)) {
        setSelectedGroupId(queryGroupId);
      } else {
        const superAdminGroup = groups.find((g) => g.name === "Super Admin");
        setSelectedGroupId(superAdminGroup ? superAdminGroup.id : groups[0].id);
      }
      initialized.current = true;
    }
  }, [groups, queryGroupId]);

  useEffect(() => {
    if (selectedGroupId) {
      dispatch(fetchGroupAccessRules(selectedGroupId));
    }
  }, [selectedGroupId, dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearGroupAccessError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => setAlertMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  const togglePermission = (
    id: string,
    field: "read" | "write" | "delete" | "export",
  ) => {
    const updated = modules.map((m) =>
      m.id === id ? { ...m, [field]: !m[field] } : m,
    );
    dispatch(setModulesOptimistic(updated));
  };

  const handleSelectAll = () => {
    const updated = modules.map((m) => ({
      ...m,
      read: true,
      write: true,
      delete: true,
      export: true,
    }));
    dispatch(setModulesOptimistic(updated));
  };

  const handleClearAll = () => {
    const updated = modules.map((m) => ({
      ...m,
      read: false,
      write: false,
      delete: false,
      export: false,
    }));
    dispatch(setModulesOptimistic(updated));
  };

  const handleSavePolicy = async () => {
    if (!selectedGroupId) return;

    // Ensure all rules have an order when explicitly saving policy if they don't already
    const orderedModules = modules.map((m, idx) => ({
      ...m,
      order: m.order ?? idx,
    }));

    const res = await dispatch(
      bulkSaveGroupAccessRules({
        groupId: selectedGroupId,
        rules: orderedModules,
      }),
    );
    if (bulkSaveGroupAccessRules.fulfilled.match(res)) {
      const groupObj = groups.find((g) => g.id === selectedGroupId);
      setAlertMsg(
        `Security policy matrix for "${groupObj?.name || "Group"}" saved successfully!`,
      );
      dispatch(checkAuth() as any);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !canWrite) return;
    const { source, destination } = result;

    if (source.index === destination.index) return;

    const newModules = Array.from(modules);
    const [moved] = newModules.splice(source.index, 1);
    newModules.splice(destination.index, 0, moved);

    const updatedModules = newModules.map((m, idx) => ({ ...m, order: idx }));

    dispatch(setModulesOptimistic(updatedModules));

    if (selectedGroupId) {
      dispatch(
        bulkSaveGroupAccessRules({
          groupId: selectedGroupId,
          rules: updatedModules,
        }),
      ).then(() => dispatch(checkAuth() as any));
    }
  };

  const handleSaveRule = async (rule: PermissionModuleAccess) => {
    if (!selectedGroupId) return;

    if (selectedRule && !selectedRule.id.startsWith("MOD-GEN-")) {
      const result = await dispatch(
        updateGroupAccessRule({ groupId: selectedGroupId, rule }),
      );
      if (updateGroupAccessRule.fulfilled.match(result)) {
        setAlertMsg(`Updated access rule for "${rule.moduleName}".`);
        dispatch(checkAuth() as any);
      } else {
        return (result.payload as string) || "Failed to update access rule";
      }
    } else {
      const result = await dispatch(
        addGroupAccessRule({ groupId: selectedGroupId, rule }),
      );
      if (addGroupAccessRule.fulfilled.match(result)) {
        setAlertMsg(`Added access rule for "${rule.moduleName}".`);
        dispatch(checkAuth() as any);
      } else {
        return (result.payload as string) || "Failed to add access rule";
      }
    }
  };

  const handleDeleteRule = (id: string, name: string) => {
    if (!selectedGroupId) return;

    Swal.fire({
      title: "Remove Access Rule?",
      text: `Are you sure you want to remove access rule for "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Remove it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const actionResult = await dispatch(
          deleteGroupAccessRule({ groupId: selectedGroupId, ruleId: id }),
        );
        if (deleteGroupAccessRule.fulfilled.match(actionResult)) {
          setAlertMsg(`Removed module rule "${name}".`);
          Swal.fire({
            title: "Removed!",
            text: `Access rule for "${name}" has been removed.`,
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const currentGroupObj = groups.find((g) => g.id === selectedGroupId);

  const getNextId = () => {
    if (!modules || modules.length === 0) return "MOD-1";
    const max = Math.max(
      ...modules.map((m) => {
        const match = m.id?.match(/MOD-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }),
    );
    return `MOD-${max + 1}`;
  };

  return (
    <>
      {alertMsg && (
        <Alert
          variant="success"
          onClose={() => setAlertMsg(null)}
          dismissible
          className="d-flex align-items-center gap-2 mb-3"
        >
          <Icon icon="check-circle" className="fs-18 flex-shrink-0" />
          <span>{alertMsg}</span>
        </Alert>
      )}

      <Card className="mb-4">
        <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light-subtle">
          <div>
            <h5 className="mb-1 fw-bold">Group Access &amp; Permission</h5>
            <p className="text-muted fs-13 mb-0">
              Configure granular module permissions and API access levels by
              user group
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {canWrite && (
              <OverlayTrigger placement="top" overlay={<Tooltip>Add Rule</Tooltip>}>
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1 fw-semibold"
                  onClick={() => {
                    setSelectedRule(null);
                    setModalOpen(true);
                  }}
                >
                  <Icon icon="plus" /> Add Rule
                </Button>
              </OverlayTrigger>
            )}
            {canWrite && (
              <OverlayTrigger placement="top" overlay={<Tooltip>Save All</Tooltip>}>
                <Button
                  variant="success"
                  size="sm"
                  className="d-flex align-items-center gap-1 fw-semibold"
                  onClick={handleSavePolicy}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <Icon icon="save" />
                  )}{" "}
                  Save Access
                </Button>
              </OverlayTrigger>
            )}
            {canReadPermissions && (
              <OverlayTrigger placement="top" overlay={<Tooltip>View Permissions</Tooltip>}>
                <Link
                  href="/admin/groups/permissions"
                  className="btn btn-info btn-sm d-flex align-items-center gap-1 fw-semibold text-white"
                >
                  <Icon icon="key" /> Permissions
                </Link>
              </OverlayTrigger>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-4">
          <Row className="align-items-center justify-content-between g-2 mb-2 p-2 bg-light rounded border mx-0">
            <Col md={5} className="d-flex align-items-center gap-2">
              <span className="fw-semibold text-dark flex-shrink-0 mb-0">
                Select Target Group:
              </span>
              <FormSelect
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="fw-semibold"
                size="sm"
              >
                {[...groups]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.memberCount} members)
                    </option>
                  ))}
              </FormSelect>
            </Col>

            <Col
              md={7}
              className="d-flex align-items-center justify-content-md-end gap-2"
            >
              {currentGroupObj && (
                <Badge
                  bg={`${currentGroupObj.badgeVariant}-subtle`}
                  className={`text-${currentGroupObj.badgeVariant} px-3 py-1 fs-12`}
                >
                  {currentGroupObj.name} Scope
                </Badge>
              )}
              {canWrite && (
                <>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={handleSelectAll}
                    className="fw-semibold"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleClearAll}
                    className="fw-semibold"
                  >
                    Clear All
                  </Button>
                </>
              )}
            </Col>
          </Row>

          <div className="table-responsive">
            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="table table-hover align-middle mb-0">
                <thead className="border-bottom">
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th className="fw-bold text-uppercase fs-12 text-muted py-3">Module &amp; Resource</th>
                    <th className="fw-bold text-uppercase fs-12 text-muted py-3">Category</th>
                    <th className="text-center fw-bold text-uppercase fs-12 text-muted py-3">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <Icon icon="eye" className="fs-14 text-primary" /> Read / View
                      </div>
                    </th>
                    <th className="text-center fw-bold text-uppercase fs-12 text-muted py-3">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <Icon icon="edit-3" className="fs-14 text-success" /> Write / Edit
                      </div>
                    </th>
                    <th className="text-center fw-bold text-uppercase fs-12 text-muted py-3">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <Icon icon="trash-2" className="fs-14 text-danger" /> Delete / Revoke
                      </div>
                    </th>
                    <th className="text-center fw-bold text-uppercase fs-12 text-muted py-3">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <Icon icon="download-cloud" className="fs-14 text-info" /> Export
                      </div>
                    </th>
                    <th className="text-end fw-bold text-uppercase fs-12 text-muted py-3">Actions</th>
                  </tr>
                </thead>
                <Droppable droppableId="modules-table">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                      {modules.map((mod, index) => (
                        <Draggable
                          key={mod.id}
                          draggableId={mod.id}
                          index={index}
                          isDragDisabled={!canWrite}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                display: snapshot.isDragging ? "table" : "",
                                background: snapshot.isDragging
                                  ? "var(--bs-light)"
                                  : "",
                              }}
                            >
                              <td
                                {...provided.dragHandleProps}
                                className="text-center text-muted"
                                style={{
                                  cursor: canWrite ? "grab" : "default",
                                }}
                              >
                                <Icon icon="grip-vertical" className="fs-16" />
                              </td>
                              <td>
                                <div className="fw-bold text-dark">
                                  {mod.moduleName}
                                </div>
                                <div className="text-muted fs-11">
                                  ID: {mod.id}
                                </div>
                              </td>
                              <td>
                                <Badge
                                  bg="secondary-subtle"
                                  className="text-secondary px-2 py-1 fs-11"
                                >
                                  {mod.category}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <FormCheck
                                  type="checkbox"
                                  checked={mod.read}
                                  disabled={!canWrite}
                                  onChange={() =>
                                    togglePermission(mod.id, "read")
                                  }
                                  aria-label={`Read ${mod.moduleName}`}
                                />
                              </td>
                              <td className="text-center">
                                <FormCheck
                                  type="checkbox"
                                  checked={mod.write}
                                  disabled={!canWrite}
                                  onChange={() =>
                                    togglePermission(mod.id, "write")
                                  }
                                  aria-label={`Write ${mod.moduleName}`}
                                />
                              </td>
                              <td className="text-center">
                                <FormCheck
                                  type="checkbox"
                                  checked={mod.delete}
                                  disabled={!canWrite}
                                  onChange={() =>
                                    togglePermission(mod.id, "delete")
                                  }
                                  aria-label={`Delete ${mod.moduleName}`}
                                />
                              </td>
                              <td className="text-center">
                                <FormCheck
                                  type="checkbox"
                                  checked={mod.export}
                                  disabled={!canWrite}
                                  onChange={() =>
                                    togglePermission(mod.id, "export")
                                  }
                                  aria-label={`Export ${mod.moduleName}`}
                                />
                              </td>
                              <td className="text-end">
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  {canWrite && (
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip
                                          id={`tooltip-edit-modal-${mod.id}`}
                                        >
                                          Edit
                                        </Tooltip>
                                      }
                                    >
                                      <Button
                                        variant="light"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedRule(mod);
                                          setModalOpen(true);
                                        }}
                                      >
                                        <Icon
                                          icon="edit"
                                          className="fs-14 text-primary"
                                        />
                                      </Button>
                                    </OverlayTrigger>
                                  )}
                                  {canDelete &&
                                    !mod.id.startsWith("MOD-GEN-") && (
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={
                                          <Tooltip
                                            id={`tooltip-delete-${mod.id}`}
                                          >
                                            Remove
                                          </Tooltip>
                                        }
                                      >
                                        <Button
                                          variant="light"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteRule(
                                              mod.id,
                                              mod.moduleName,
                                            )
                                          }
                                        >
                                          <Icon
                                            icon="trash-2"
                                            className="fs-14 text-danger"
                                          />
                                        </Button>
                                      </OverlayTrigger>
                                    )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </DragDropContext>
          </div>
        </CardBody>
      </Card>

      <AccessRuleModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        rule={selectedRule}
        onSave={handleSaveRule}
        availableModules={permissions.map((p) => p.name)}
        nextId={getNextId()}
      />
    </>
  );
};

export default GroupAccessContent;
