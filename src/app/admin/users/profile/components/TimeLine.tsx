import small1 from "@/assets/images/stock/small-1.jpg";
import small2 from "@/assets/images/stock/small-2.jpg";
import small3 from "@/assets/images/stock/small-3.jpg";
import user1 from "@/assets/images/users/user-1.jpg";
import user2 from "@/assets/images/users/user-2.jpg";
import user3 from "@/assets/images/users/user-3.jpg";
import user4 from "@/assets/images/users/user-4.jpg";
import Icon from "@/components/wrappers/Icon";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";

const TimeLine = () => {
  const [isLiked1, setIsLiked1] = useState(false);
  const [isLiked2, setIsLiked2] = useState(false);

  const handleLike1 = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked1(!isLiked1);
  };

  const handleLike2 = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked2(!isLiked2);
  };

  return (
    <>
      <Form className="mb-3">
        <textarea
          rows={3}
          className="form-control"
          placeholder="Write something..."
        />
        <div className="d-flex py-2 justify-content-between">
          <div>
            <Link href="" className="btn btn-sm btn-icon btn-light me-1">
              <Icon icon="user" className="fs-md" />
            </Link>
            <Link href="" className="btn btn-sm btn-icon btn-light me-1">
              <Icon icon="map-pin" className="fs-md" />
            </Link>
            <Link href="" className="btn btn-sm btn-icon btn-light me-1">
              <Icon icon="camera" className="fs-md" />
            </Link>
            <Link href="" className="btn btn-sm btn-icon btn-light">
              <Icon icon="smile" className="fs-md" />
            </Link>
          </div>
          <button type="submit" className="btn btn-sm btn-dark">
            Post
          </button>
        </div>
      </Form>

      <div className="border border-light border-dashed rounded p-2 mb-3">
        <div className="d-flex align-items-center mb-2">
          <Image
            className="me-2 avatar-md rounded-circle"
            src={user3}
            alt="Generic placeholder image"
          />
          <div className="w-100">
            <h5 className="m-0">Jeremy Tomlinson</h5>
            <p className="text-muted mb-0">
              <small>about 2 minutes ago</small>
            </p>
          </div>
        </div>
        <p>
          Story based around the idea of time lapse, animation to post soon!
        </p>
        <Image
          src={small1}
          alt="post-img"
          className="rounded me-1"
          height={60}
        />
        <Image
          src={small2}
          alt="post-img"
          className="rounded me-1"
          height={60}
        />
        <Image src={small3} alt="post-img" className="rounded" height={60} />
        <div className="mt-2">
          <Link href="" className="btn btn-sm btn-link text-muted">
            <Icon icon="corner-up-left" className="fs-sm me-1" />
            Reply
          </Link>
          <button
            type="button"
            className="btn btn-sm fs-sm btn-link text-muted"
            onClick={handleLike1}
          >
            {isLiked1 ? (
              <span className="align-middle">
                <Icon icon="heart" className="text-danger" /> Liked!
              </span>
            ) : (
              <span className="align-middle">
                <Icon icon="heart" className="text-muted" /> Like
              </span>
            )}
          </button>
          <Link href="" className="btn btn-sm btn-link text-muted">
            <Icon icon="share-2" className="fs-sm me-1" />
            Share
          </Link>
        </div>
      </div>

      <div className="border border-light border-dashed rounded p-2 mb-3">
        <div className="d-flex align-items-center mb-2">
          <Image
            className="me-2 avatar-sm rounded-circle"
            src={user4}
            alt="Generic placeholder image"
          />
          <div className="w-100">
            <h5 className="m-0">Sophia Martinez</h5>
            <p className="text-muted mb-0">
              <small>about 30 minutes ago</small>
            </p>
          </div>
        </div>
        <div className="fs-16 text-center mt-3 mb-4 fst-italic">
          <Icon icon="quote" className="fs-20" />
          Just finished a weekend project! Built a small weather app using React
          and OpenWeather API. Feeling excited to share the results with
          everyone soon. 🚀
        </div>
        <div className="bg-light-subtle m-n2 p-2 border-top border-bottom border-dashed">
          <div className="d-flex align-items-start">
            <Image
              className="me-2 avatar-sm rounded-circle"
              src={user1}
              alt="Generic placeholder image"
            />
            <div className="w-100">
              <h5 className="mt-0 mb-1">
                Liam Johnson
                <small className="text-muted">10 minutes ago</small>
              </h5>
              That sounds awesome! Can&apos;t wait to see how you designed the
              UI.
              <br />
              <Link href="" className="btn btn-sm btn-link text-muted">
                <Icon icon="corner-up-left" className="fs-sm me-1" />
                Reply
              </Link>
              <div className="d-flex align-items-start mt-3">
                <Link className="pe-2" href="">
                  <Image
                    src={user2}
                    className="avatar-sm rounded-circle"
                    alt="Generic placeholder image"
                  />
                </Link>
                <div className="w-100">
                  <h5 className="mt-0 mb-1">
                    Olivia Carter
                    <small className="text-muted">15 minutes ago</small>
                  </h5>
                  I recently built something similar with Vue. Let&apos;s
                  collaborate sometime!
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-start mt-2">
            <Link className="pe-2" href="">
              <Image
                src={user3}
                className="rounded-circle"
                alt="Generic placeholder image"
                height={31}
              />
            </Link>
            <div className="w-100">
              <input
                type="text"
                id="simpleinput"
                className="form-control form-control-sm"
                placeholder="Add a comment..."
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Link href="" className="btn btn-sm btn-link text-muted">
            <Icon icon="corner-up-left" className="fs-sm me-1" />
            Reply
          </Link>
          <button
            type="button"
            className="btn btn-sm fs-sm btn-link text-muted"
            onClick={handleLike2}
          >
            {isLiked2 ? (
              <span className="align-middle">
                <Icon icon="heart" className="text-danger" />
                Liked!
              </span>
            ) : (
              <span className="align-middle">
                <Icon icon="heart" className="text-muted" />
                Like
              </span>
            )}
          </button>
          <Link href="" className="btn btn-sm btn-link text-muted">
            <Icon icon="share-2" className="fs-sm me-1" />
            Share
          </Link>
        </div>
      </div>

      <div className="border border-light border-dashed rounded p-2 mb-3">
        <div className="d-flex align-items-center mb-2">
          <Image
            className="me-2 avatar-sm rounded-circle"
            src={user2}
            alt="Profile photo of Anika Roy"
          />
          <div className="w-100">
            <h5 className="m-0">Anika Roy</h5>
            <p className="text-muted mb-0">
              <small>2 hours ago</small>
            </p>
          </div>
        </div>
        <p>
          Sharing a couple of timelapses from my recent Iceland trip. Let me
          know which one you like most!
        </p>
        <Row className="g-2">
          <Col md={6}>
            <div className="ratio ratio-16x9 rounded overflow-hidden">
              <iframe
                src="https://player.vimeo.com/video/1084537"
                allowFullScreen
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="ratio ratio-16x9 rounded overflow-hidden">
              <iframe
                src="https://player.vimeo.com/video/76979871"
                allowFullScreen
              />
            </div>
          </Col>
        </Row>
      </div>
      <div className="d-flex align-items-center justify-content-center gap-2 p-3">
        <strong>Loading...</strong>
        <div
          className="spinner-border spinner-border-sm text-danger"
          role="status"
          aria-hidden="true"
        />
      </div>
    </>
  );
};

export default TimeLine;
