"use client";

import { Icon as IconifyIcon } from "@iconify/react";
import clsx from "clsx";
import { Card, CardBody } from "react-bootstrap";
import CountUp from "react-countup";
import { stateData } from "./data";

const EcomStats = ({ item }: { item: (typeof stateData)[0] }) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="avatar fs-60 avatar-img-size flex-shrink-0">
            <span
              className={clsx(
                "avatar-title rounded-circle fs-24",
                item.className,
              )}
            >
              <IconifyIcon icon={item.icon}></IconifyIcon>
            </span>
          </div>
          <div className="text-end">
            <h3 className="mb-2 fw-normal">
              {" "}
              {item?.prefix}
              <CountUp
                duration={1}
                decimals={Number.isInteger(item.value) ? 0 : 2}
                end={item.value}
                enableScrollSpy
                scrollSpyOnce
              />
              {item?.suffix}
            </h3>
            <p className="mb-0 text-muted">
              <span>{item.title}</span>
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EcomStats;
