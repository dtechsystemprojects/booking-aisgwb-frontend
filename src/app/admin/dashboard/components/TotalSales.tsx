"use client";

import ChartJs from "@/components/wrappers/ChartJs";
import { ArcElement, DoughnutController, PointElement } from "chart.js";
import { multiPieChart } from "./data";

const TotalSales = () => {
  return (
    <div className="p-3 border-end border-dashed">
      <h4 className="card-title mb-0">Total Sales</h4>
      <p className="text-muted fs-xs">
        You have 21 pending orders awaiting fulfillment.
      </p>

      <div className="row mt-4">
        <div className="col-lg-12">
          <ChartJs
            type="doughnut"
            getOptions={multiPieChart}
            plugins={[DoughnutController, PointElement, ArcElement]}
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default TotalSales;
