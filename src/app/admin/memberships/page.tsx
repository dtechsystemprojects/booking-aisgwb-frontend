import React from 'react';
import MembershipListContent from './components/MembershipListContent';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { Col, Row } from 'react-bootstrap';

const MembershipsPage = () => {
  return (
    <>
      <PageBreadcrumb title="Life Time Memberships" subtitle="Admin" />
      <Row>
        <Col xs={12}>
          <div className="card">
            <div className="card-body">
              <MembershipListContent />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default MembershipsPage;
