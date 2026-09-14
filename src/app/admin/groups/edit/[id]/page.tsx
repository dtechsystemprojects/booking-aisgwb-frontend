"use client";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
  Spinner,
} from "react-bootstrap";
import {
  initialModulePermissions,
  UserGroupRecord,
} from "@/app/admin/dataStore";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGroupById,
  updateGroup,
  clearGroupError,
} from "@/redux/slices/admin/groupSlice";
import Swal from "sweetalert2";

const EditGroupPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const dispatch = useAppDispatch();
  const { currentGroup, loading, error } = useAppSelector(
    (state) => state.groups,
  );

  const [formData, setFormData] = useState<UserGroupRecord>({
    id: id || "",
    name: "",
    description: "",
    badgeVariant: "primary",
    memberCount: 0,
    status: "Active",
    createdDate: "",
    permissionsCount: 0,
  });
  const [permissions, setPermissions] = useState(initialModulePermissions);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentGroup && currentGroup.id === id) {
      setFormData({
        id: currentGroup.id,
        name: currentGroup.name || "",
        description: currentGroup.description || "",
        badgeVariant: currentGroup.badgeVariant || "primary",
        memberCount: currentGroup.memberCount || 0,
        status: currentGroup.status || "Active",
        createdDate: currentGroup.createdDate || "",
        permissionsCount: currentGroup.permissionsCount || 0,
      });
      if (currentGroup.permissions && currentGroup.permissions.length > 0) {
        setPermissions(currentGroup.permissions);
      }
    }
  }, [currentGroup, id]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearGroupError());
    }
  }, [error, dispatch]);

  const togglePerm = (
    idx: number,
    type: "read" | "write" | "delete" | "export",
  ) => {
    setPermissions((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [type]: !m[type] } : m)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      permissions,
    };

    const resultAction = await dispatch(updateGroup(payload));
    if (updateGroup.fulfilled.match(resultAction)) {
      setSaved(true);
      setTimeout(() => {
        router.push("/admin/groups");
      }, 1100);
    }
  };

  return (
    <>
      <PageBreadcrumb
        title={`Edit Group: ${formData.name}`}
        subtitle="User Groups"
      />

      {saved && (
        <Alert
          variant="success"
          className="d-flex align-items-center gap-2 mb-3"
        >
          <Icon icon="check-circle" className="fs-18 flex-shrink-0" />
          <span>
            Group &quot;{formData.name}&quot; updated successfully!
            Redirecting...
          </span>
        </Alert>
      )}

      <Row className="justify-content-center">
        <Col lg={10}>
          <form onSubmit={handleSubmit}>
            <Card className="mb-4">
              <CardHeader className="d-flex justify-content-between align-items-center bg-light-subtle">
                <div className="d-flex align-items-center gap-2">
                  <Icon icon="shield" className="text-primary fs-20" />
                  <h5 className="mb-0 fw-bold">
                    Update Group &amp; Module Policies ({formData.id})
                  </h5>
                </div>
                <Link
                  href="/admin/groups"
                  className="btn btn-light btn-sm d-flex align-items-center gap-1"
                >
                  <Icon icon="arrow-left" /> Back to Groups
                </Link>
              </CardHeader>

              <CardBody className="p-4">
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <FormLabel className="fw-semibold">
                      Group / Role Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <FormLabel className="fw-semibold">
                      Badge Theme Color
                    </FormLabel>
                    <FormSelect
                      value={formData.badgeVariant}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          badgeVariant: e.target.value as any,
                        })
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

                  <Col md={3}>
                    <FormLabel className="fw-semibold">Status</FormLabel>
                    <FormSelect
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </FormSelect>
                  </Col>

                  <Col xs={12}>
                    <FormLabel className="fw-semibold">
                      Group Description
                    </FormLabel>
                    <FormControl
                      as="textarea"
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>

                <h6 className="fw-bold mb-3 border-bottom pb-2">
                  Module Access Policy
                </h6>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Module &amp; Category</th>
                        <th className="text-center">Read / View</th>
                        <th className="text-center">Write / Create</th>
                        <th className="text-center">Delete</th>
                        <th className="text-center">Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(permissions) &&
                        permissions.map((mod, idx) => (
                          <tr key={mod.id}>
                            <td>
                              <div className="fw-semibold text-dark">
                                {mod.moduleName}
                              </div>
                              <div className="text-muted fs-11">
                                {mod.category}
                              </div>
                            </td>
                            <td className="text-center">
                              <FormCheck
                                checked={mod.read}
                                onChange={() => togglePerm(idx, "read")}
                              />
                            </td>
                            <td className="text-center">
                              <FormCheck
                                checked={mod.write}
                                onChange={() => togglePerm(idx, "write")}
                              />
                            </td>
                            <td className="text-center">
                              <FormCheck
                                checked={mod.delete}
                                onChange={() => togglePerm(idx, "delete")}
                              />
                            </td>
                            <td className="text-center">
                              <FormCheck
                                checked={mod.export}
                                onChange={() => togglePerm(idx, "export")}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>

              <div className="card-footer bg-light-subtle d-flex justify-content-end gap-2 p-3">
                <Link
                  href="/admin/groups"
                  className="btn btn-light fw-semibold"
                >
                  Cancel
                </Link>
                <Button
                  variant="primary"
                  type="submit"
                  className="fw-semibold px-4 d-flex align-items-center gap-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <Icon icon="save" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </form>
        </Col>
      </Row>
    </>
  );
};

export default EditGroupPage;
