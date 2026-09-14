import React from 'react';
import { Modal, Button, Row, Col, Badge, Card, CardBody } from 'react-bootstrap';
import dayjs from 'dayjs';

interface TransactionDetailsModalProps {
  show: boolean;
  onHide: () => void;
  transaction: any | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ show, onHide, transaction }) => {
  if (!transaction) return null;

  const renderStatusBadge = (status: string) => {
    let color = 'secondary';
    if (status === 'Success') color = 'success';
    if (status === 'Pending') color = 'warning';
    if (status === 'Failed') color = 'danger';
    return <Badge bg={color} className="px-3 py-2 fs-6 rounded-pill">{status}</Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold h4">Transaction Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3 pb-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h6 className="text-muted mb-1 fs-xs text-uppercase fw-semibold">Amount</h6>
            <h3 className="fw-bolder text-primary mb-0">₹{transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="text-end">
            <h6 className="text-muted mb-1 fs-xs text-uppercase fw-semibold">Status</h6>
            {renderStatusBadge(transaction.status)}
          </div>
        </div>

        <Row className="g-3">
          <Col md={12}>
            <Card className="border shadow-none h-100 bg-light">
              <CardBody className="p-3">
                <Row className="g-3">
                  <Col sm={6}>
                    <div className="text-muted fs-xs text-uppercase fw-semibold mb-1">Transaction Ref</div>
                    <div className="fw-medium text-dark">{transaction.transactionRef || 'N/A'}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted fs-xs text-uppercase fw-semibold mb-1">Date & Time</div>
                    <div className="fw-medium text-dark">
                      {transaction.dateAndTime ? dayjs(transaction.dateAndTime).format("MMM DD, YYYY - hh:mm A") : dayjs(transaction.createdAt).format("MMM DD, YYYY - hh:mm A")}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted fs-xs text-uppercase fw-semibold mb-1">Payment Method</div>
                    <div className="fw-medium text-dark">{transaction.paymentMethod || 'Manual'}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted fs-xs text-uppercase fw-semibold mb-1">Description</div>
                    <div className="fw-medium text-dark">{transaction.description || '-'}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted fs-xs text-uppercase fw-semibold mb-1">Transaction Type</div>
                    <div className="fw-medium text-dark text-capitalize">{transaction.type?.toLowerCase() || '-'}</div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {transaction.eventId && (
            <Col md={6}>
              <Card className="border shadow-none h-100">
                <CardBody className="p-3">
                  <h6 className="border-bottom pb-2 mb-3 fw-bold text-dark">Event Details</h6>
                  <div className="mb-2">
                    <span className="text-muted d-block fs-xs">Event Name</span>
                    <span className="fw-medium">{transaction.eventId.title || 'Unknown Event'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted d-block fs-xs">Date & Time</span>
                    <span className="fw-medium">
                      {transaction.eventId.startDate ? dayjs(transaction.eventId.startDate).format("MMM DD, YYYY") : '-'} 
                      {transaction.eventId.startTime ? ` at ${transaction.eventId.startTime}` : ''}
                    </span>
                  </div>
                  <div className="mb-0">
                    <span className="text-muted d-block fs-xs">Venue Location</span>
                    <span className="fw-medium">{transaction.eventId.venueLocation || '-'}</span>
                  </div>
                </CardBody>
              </Card>
            </Col>
          )}

          {transaction.userId && (
            <Col md={6}>
              <Card className="border shadow-none h-100">
                <CardBody className="p-3">
                  <h6 className="border-bottom pb-2 mb-3 fw-bold text-dark">User Details</h6>
                  <div className="mb-2">
                    <span className="text-muted d-block fs-xs">Name</span>
                    <span className="fw-medium">{transaction.userId.name || transaction.userId.firstName || 'Unknown User'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted d-block fs-xs">Email</span>
                    <span className="fw-medium text-break">{transaction.userId.email}</span>
                  </div>
                  <div className="mb-0">
                    <span className="text-muted d-block fs-xs">Mobile</span>
                    <span className="fw-medium">{transaction.userId.mobile || '-'}</span>
                  </div>
                </CardBody>
              </Card>
            </Col>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0 pe-4 pb-4">
        <Button variant="secondary" onClick={onHide} className="px-4 shadow-sm">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionDetailsModal;
