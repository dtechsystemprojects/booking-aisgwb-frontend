import Icon from "@/components/wrappers/Icon";
import Link from "next/link";
import {
  Button,
  Col,
  Form,
  FormControl,
  FormLabel,
  Row,
} from "react-bootstrap";

const Settings = () => {
  return (
    <Form>
      <h5 className="mb-3 text-uppercase bg-light-subtle p-1 border-dashed border rounded border-light text-center">
        <Icon icon="circle-user-round" className="fs-lg" /> Personal Info
      </h5>
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>First Name</FormLabel>
            <FormControl
              type="text"
              id="firstname"
              placeholder="Enter first name"
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Last Name</FormLabel>
            <FormControl
              type="text"
              id="lastname"
              placeholder="Enter last name"
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Job Title</FormLabel>
            <FormControl
              type="text"
              id="jobtitle"
              placeholder="e.g. UI Developer, Designer"
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Phone Number</FormLabel>
            <FormControl type="text" id="phone" placeholder="+1 234 567 8901" />
          </div>
        </Col>
      </Row>
      <div className="mb-3">
        <FormLabel>Bio</FormLabel>
        <textarea
          className="form-control"
          id="userbio"
          rows={4}
          placeholder="Write something about yourself..."
        />
      </div>
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Email Address</FormLabel>
            <FormControl
              type="email"
              id="useremail"
              placeholder="Enter email"
            />
            <span className="form-text fs-xs fst-italic text-muted">
              <Link href="" className="link-reset">
                Click here to change your email
              </Link>
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Password</FormLabel>
            <FormControl
              type="password"
              id="userpassword"
              placeholder="Enter new password"
            />
            <span className="form-text fs-xs fst-italic text-muted">
              <Link href="" className="link-reset">
                Click here to change your password
              </Link>
            </span>
          </div>
        </Col>
      </Row>
      <div className="mb-4">
        <FormLabel>Profile Photo</FormLabel>
        <FormControl type="file" id="profilephoto" />
      </div>
      <h5 className="mb-3 text-uppercase bg-light-subtle p-1 border-dashed border rounded border-light text-center">
        <Icon icon="map-pin" className="fs-lg" /> Address Info
      </h5>
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Address Line 1</FormLabel>
            <FormControl
              type="text"
              id="address-line1"
              placeholder="Street, Apartment, Unit, etc."
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Address Line 2</FormLabel>
            <FormControl
              type="text"
              id="address-line2"
              placeholder="Optional"
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <div className="mb-3">
            <FormLabel>City</FormLabel>
            <FormControl type="text" id="city" placeholder="City" />
          </div>
        </Col>
        <Col md={4}>
          <div className="mb-3">
            <FormLabel>State / Province</FormLabel>
            <FormControl
              type="text"
              id="state"
              placeholder="State or Province"
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="mb-3">
            <FormLabel>Postal / ZIP Code</FormLabel>
            <FormControl type="text" id="zipcode" placeholder="Postal Code" />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Country</FormLabel>
            <FormControl type="text" id="country" placeholder="Country" />
          </div>
        </Col>
      </Row>
      <h5 className="mb-3 text-uppercase bg-light-subtle p-1 border-dashed border rounded border-light text-center">
        <Icon icon="building" className="fs-lg" /> Company Info
      </h5>
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Company Name</FormLabel>
            <FormControl
              type="text"
              id="companyname"
              placeholder="Enter company name"
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <FormLabel>Website</FormLabel>
            <FormControl
              type="text"
              id="cwebsite"
              placeholder="https://yourcompany.com"
            />
          </div>
        </Col>
      </Row>
      <h5 className="mb-3 text-uppercase bg-light-subtle p-1 border-dashed border rounded border-light text-center">
        <Icon icon="earth" className="fs-lg" /> Social
      </h5>
      <Row className="g-3">
        <Col md={6}>
          <FormLabel>Facebook</FormLabel>
          <div className="input-group">
            <span className="input-group-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
              </svg>
            </span>
            <FormControl
              type="text"
              id="social-fb"
              placeholder="Facebook URL"
            />
          </div>
        </Col>
        <Col md={6}>
          <FormLabel>Twitter X</FormLabel>
          <div className="input-group">
            <span className="input-group-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-x"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </span>
            <FormControl type="text" id="social-tw" placeholder="@username" />
          </div>
        </Col>
        <Col md={6}>
          <FormLabel>Instagram</FormLabel>
          <div className="input-group">
            <span className="input-group-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M16.5 7.5v.01" />
              </svg>
            </span>
            <FormControl
              type="text"
              id="social-insta"
              placeholder="Instagram URL"
            />
          </div>
        </Col>
        <Col md={6}>
          <FormLabel>LinkedIn</FormLabel>
          <div className="input-group">
            <span className="input-group-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-linkedin"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M8 11v5" />
                <path d="M8 8v.01" />
                <path d="M12 16v-5" />
                <path d="M16 16v-3a2 2 0 1 0 -4 0" />
                <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
              </svg>
            </span>
            <FormControl
              type="text"
              id="social-lin"
              placeholder="LinkedIn Profile"
            />
          </div>
        </Col>
        <Col md={6}>
          <FormLabel>GitHub</FormLabel>
          <div className="input-group">
            <span className="input-group-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-github"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
              </svg>
            </span>
            <FormControl
              type="text"
              id="social-gh"
              placeholder="GitHub Username"
            />
          </div>
        </Col>
        <Col md={6}>
          <FormLabel>Dribble</FormLabel>
          <div className="input-group">
            <span className="input-group-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-dribbble"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <path d="M9 3.6c5 6 7 10.5 7.5 16.2" />
                <path d="M6.4 19c3.5 -3.5 6 -6.5 14.5 -6.4" />
                <path d="M3.1 10.75c5 0 9.814 -.38 15.314 -5" />
              </svg>
            </span>
            <FormControl type="text" id="social-sky" placeholder="@username" />
          </div>
        </Col>
      </Row>
      <div className="text-end mt-4">
        <Button variant="success" type="submit">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default Settings;
