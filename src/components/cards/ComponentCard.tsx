"use client";
import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Collapse,
} from "react-bootstrap";

import Icon from "@/components/wrappers/Icon";
import type { ChildrenType } from "@/types";
import clsx from "clsx";

type ComponentCardProps = {
  title: string;
  isCollapsible?: boolean;
  isRefreshable?: boolean;
  isCloseable?: boolean;
  className?: string;
  cardTitleClassName?: string;
  bodyClassName?: string;
} & ChildrenType;

const ComponentCard = ({
  title,
  isCloseable,
  isCollapsible,
  isRefreshable,
  className,
  bodyClassName,
  cardTitleClassName,
  children,
}: ComponentCardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Simulate a refresh action
  // In a real-world scenario, you would fetch new data here
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <Card className={clsx(isCollapsed && "card-collapse", className)}>
      {isRefreshing && (
        <div className="card-overlay d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" />
        </div>
      )}

      <CardHeader className="justify-content-between align-items-center">
        <CardTitle className={clsx(cardTitleClassName)}>{title}</CardTitle>
        <div className="card-action">
          {isCollapsible && (
            <span className="card-action-item" onClick={handleToggle}>
              <Icon
                icon="chevron-up"
                style={{ rotate: isCollapsed ? "180deg" : "0deg" }}
              />
            </span>
          )}
          {isRefreshable && (
            <span className="card-action-item" onClick={handleRefresh}>
              <Icon icon="refresh-ccw" />
            </span>
          )}
          {isCloseable && (
            <span className="card-action-item" onClick={handleClose}>
              <Icon icon="x" />
            </span>
          )}
        </div>
      </CardHeader>

      {isCollapsible ? (
        <Collapse in={!isCollapsed}>
          <CardBody className={bodyClassName}>{children}</CardBody>
        </Collapse>
      ) : (
        <CardBody className={bodyClassName}>{children}</CardBody>
      )}
    </Card>
  );
};

export default ComponentCard;
