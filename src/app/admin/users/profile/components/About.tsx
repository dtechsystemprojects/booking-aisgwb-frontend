import Icon from "@/components/wrappers/Icon";
import { toPascalCase } from "@/utils/helpers";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { CardTitle, Table } from "react-bootstrap";
import { taskData, timelineData } from "./data";

const About = () => {
  return (
    <>
      <p>
        I&apos;m an Admin Template Author dedicated to building clean,
        efficient, and highly customizable dashboards for developers and
        businesses. My goal is to create UI solutions that are modern, scalable,
        and easy to integrate.
      </p>
      <p>
        I specialize in crafting developer-friendly admin panels and UI kits
        using frameworks like Bootstrap, Tailwind CSS, React, Vue, Angular,
        Laravel, and Next.js. My templates are designed to accelerate
        development and provide a strong foundation for web apps, SaaS
        platforms, and enterprise tools.
      </p>
      <p className="mb-0">
        I focus on delivering well-structured, pixel-perfect layouts with a
        user-centric approach—ensuring responsive design, clean code, and
        seamless user experiences. Whether you&apos;re building a CRM, analytics
        dashboard, or backend system, my templates are made to help you build
        faster and smarter.
      </p>
      <CardTitle as="h4" className="my-3 text-uppercase fs-sm">
        <Icon icon="briefcase" /> Professional Experience:
      </CardTitle>
      <div className="timeline">
        {timelineData.map((item, index) => (
          <div key={index} className="timeline-item d-flex align-items-stretch">
            <div className="timeline-time pe-3 text-muted">
              {item.yearRange}
            </div>
            <div className={clsx("timeline-dot ", item.bulletClassName)} />
            <div
              className={clsx(
                "timeline-content ps-3",
                index === timelineData.length - 1 ? "" : "pb-4",
              )}
            >
              <h5 className="mb-1">{item.title}</h5>
              <p className="mb-1 text-muted">{item.description}</p>
              <span className="text-muted fw-semibold">at {item.company}</span>
            </div>
          </div>
        ))}
      </div>
      <CardTitle as="h4" className="my-3 text-uppercase fs-sm">
        <Icon icon="list-check" />
        Tasks Overview:
      </CardTitle>

      <Table
        responsive
        className="table-centered table-custom table-sm table-nowrap table-hover mb-0"
      >
        <thead className="bg-light bg-opacity-25 thead-sm">
          <tr className="text-uppercase fs-xxs">
            <th>Task</th>
            <th>Status</th>
            <th>Assigned By</th>
            <th>Start Date</th>
            <th>Priority</th>
            <th>Progress</th>
            <th>Total Time Spent</th>
            <th style={{ width: 30 }} />
          </tr>
        </thead>
        <tbody>
          {taskData.map((task, idx) => (
            <tr key={idx}>
              <td>
                <h5 className="fs-sm my-1">
                  <Link href="" className="text-body">
                    {task.title}
                  </Link>
                </h5>
                <span className="text-muted fs-xs">{task.due}</span>
              </td>
              <td>
                <span
                  className={`badge ${task.status === "outdated" ? "badge-soft-danger" : task.status === "in-progress" ? "badge-soft-warning" : task.status === "on-hold" ? "badge-soft-dark" : "badge-soft-success"}`}
                >
                  {toPascalCase(task.status)}
                </span>
              </td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm">
                    <Image
                      src={task.user.image}
                      alt={task.user.name}
                      className="img-fluid rounded-circle"
                    />
                  </div>
                  <div>
                    <h5 className="text-nowrap fs-sm mb-0">{task.user.name}</h5>
                    <p className="text-muted fs-xs mb-0">{task.user.email}</p>
                  </div>
                </div>
              </td>
              <td>{task.startDate}</td>
              <td>
                <span
                  className={`badge ${task.priority === "high" ? "badge-soft-danger" : task.priority === "medium" ? "badge-soft-primary" : "badge-soft-secondary"}`}
                >
                  {toPascalCase(task.priority)}
                </span>
              </td>
              <td>{task.progress}</td>
              <td>{task.time}</td>
              <td>
                <Link href="" className="text-muted fs-xxl">
                  <Icon icon="pencil" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default About;
