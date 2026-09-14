"use client";

import ChartJs from "@/components/wrappers/ChartJs";
import Icon from "@/components/wrappers/Icon";
import {
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";
import Link from "next/link";
import { CardTitle } from "react-bootstrap";
import { salesAnalyticsChart } from "./data";

const SalesAnalytics = () => {
  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between mb-3">
        <CardTitle as="h4">Sales Analytics</CardTitle>
        <Link
          href=""
          className="link-reset text-decoration-underline fw-semibold link-offset-3"
        >
          View Reports <Icon icon="arrow-right"></Icon>
        </Link>
      </div>

      <div dir="ltr">
        <div className="mt-3">
          <ChartJs
            height={330}
            type="bar"
            getOptions={salesAnalyticsChart}
            plugins={[
              BarController,
              LineController,
              PointElement,
              LineElement,
              BarElement,
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
