"use client";
import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { UserGroupRecord } from "@/app/admin/dataStore";
import GroupModal from "./GroupModal";
import Swal from "sweetalert2";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  clearGroupError,
} from "@/redux/slices/admin/groupSlice";
import { usePageAccess, useAccess } from "@/hooks/useAccess";

const GroupListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { groups, loading, error } = useAppSelector((state) => state.groups);

  const { write: canWrite, delete: canDelete } = usePageAccess("Groups");
  const { read: canReadPermissions } = useAccess("Permissions");
  const { read: canReadGroupAccess } = useAccess("Group Access");

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroupRecord | null>(
    null,
  );
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearGroupError());
    }
  }, [error, dispatch]);

  const handleOpenAdd = () => {
    setSelectedGroup(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (grp: UserGroupRecord) => {
    setSelectedGroup(grp);
    setModalOpen(true);
  };

  const handleSaveGroup = async (record: UserGroupRecord) => {
    try {
      const isEdit = groups.some((g) => g.id === record.id);

      if (isEdit) {
        await dispatch(updateGroup(record)).unwrap();
        setAlertMsg(`Group "${record.name}" updated successfully.`);
        setTimeout(() => setAlertMsg(null), 3500);
      } else {
        await dispatch(addGroup(record)).unwrap();
        setAlertMsg(`Group "${record.name}" created successfully.`);
        setTimeout(() => setAlertMsg(null), 3500);
      }
    } catch (err: any) {
      console.error("Error saving group:", err);
      Swal.fire("Error", err || "Failed to save group", "error");
    }
  };

  const handleDeleteGroup = (id: string, name: string) => {
    Swal.fire({
      title: "Delete Group?",
      text: `Are you sure you want to delete group "${name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteGroup(id)).unwrap();
          setAlertMsg(`Group "${name}" has been deleted.`);
          setTimeout(() => setAlertMsg(null), 3500);
          Swal.fire({
            title: "Deleted!",
            text: `Group "${name}" has been deleted.`,
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
        } catch (err: any) {
          console.error("Error deleting group:", err);
          Swal.fire("Error", err || "Failed to delete group", "error");
        }
      }
    });
  };

  const safeGroups = Array.isArray(groups) ? groups : [];
  const filteredGroups = safeGroups.filter(
    (g) =>
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className="position-relative" style={{ width: "300px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {canWrite && (
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 fw-semibold"
              onClick={handleOpenAdd}
            >
              <Icon icon="plus" /> Add Group
            </Button>
          )}
          {canReadPermissions && (
            <Link
              href="/admin/groups/permissions"
              className="btn btn-info btn-sm d-flex align-items-center gap-1 fw-semibold text-white"
            >
              <Icon icon="key" /> Permissions
            </Link>
          )}
          {canReadGroupAccess && (
            <Link
              href="/admin/group-access"
              className="btn btn-dark btn-sm d-flex align-items-center gap-1 fw-semibold"
            >
              <Icon icon="shield" /> Group Access
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row className="g-4">
          {filteredGroups.map((group) => (
            <Col md={6} xl={4} key={group.id}>
              <Card className="h-100 shadow-sm border">
                <CardHeader className="d-flex align-items-center justify-content-between bg-light-subtle py-3">
                  <div className="d-flex align-items-center gap-2">
                    <Badge
                      bg={`${group.badgeVariant}-subtle`}
                      className={`text-${group.badgeVariant} px-3 py-1 fs-13 fw-semibold`}
                    >
                      {group.name}
                    </Badge>
                    <span className="text-muted fs-11">({group.id})</span>
                  </div>
                  <Badge
                    bg={
                      group.status === "Active"
                        ? "success-subtle"
                        : "warning-subtle"
                    }
                    className={`text-${group.status === "Active" ? "success" : "warning-emphasis"} fs-11`}
                  >
                    {group.status}
                  </Badge>
                </CardHeader>

                <CardBody className="py-3">
                  <p
                    className="text-muted fs-13 mb-4"
                    style={{ minHeight: "48px" }}
                  >
                    {group.description}
                  </p>

                  <div className="d-flex align-items-center justify-content-between py-2 border-top border-bottom">
                    <div className="text-center">
                      <div className="fw-bold fs-16 text-dark">
                        {group.memberCount || 0}
                      </div>
                      <div className="text-muted fs-12">Assigned Users</div>
                    </div>
                    <div className="text-center border-start border-end px-3">
                      <div className="fw-bold fs-16 text-primary">
                        {group.permissionsCount || 0}
                      </div>
                      <div className="text-muted fs-12">Access Rules</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-semibold fs-13 text-dark">
                        {group.createdDate}
                      </div>
                      <div className="text-muted fs-12">Created Date</div>
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="bg-light-subtle d-flex justify-content-between align-items-center py-2">
                  {canReadGroupAccess ? (
                    <Link
                      href={`/admin/group-access?groupId=${group.id}`}
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold fs-13 d-flex align-items-center gap-1"
                    >
                      <Icon icon="key" /> Group Access &rarr;
                    </Link>
                  ) : (
                    <div></div>
                  )}

                  <div className="d-flex align-items-center gap-1">
                    {canWrite && (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-edit-modal-${group.id}`}>
                            Edit Group
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => handleOpenEdit(group)}
                        >
                          <Icon icon="edit" className="text-primary fs-14" />
                        </Button>
                      </OverlayTrigger>
                    )}
                    {canDelete && (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-delete-${group.id}`}>
                            Delete Group
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() =>
                            handleDeleteGroup(group.id, group.name)
                          }
                        >
                          <Icon icon="trash-2" className="text-danger fs-14" />
                        </Button>
                      </OverlayTrigger>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Col>
          ))}
          {filteredGroups.length === 0 && (
            <Col xs={12}>
              <div className="text-center py-5 text-muted">
                <Icon
                  icon="inbox"
                  className="fs-24 mb-2 d-block mx-auto text-muted"
                />
                No groups found. Create a new group to get started.
              </div>
            </Col>
          )}
        </Row>
      )}

      <GroupModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        group={selectedGroup}
        onSave={handleSaveGroup}
      />
    </>
  );
};

export default GroupListContent;
