"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface LeadData {
  _id: number;
  count: number;
}

export default function BarChartOne() {
  const [chartData, setChartData] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/leads");
        const result = await res.json();

        if (!result.success) return;

        const monthly = Array(12).fill(0);

        result.data.forEach((entry: LeadData) => {
          monthly[entry._id - 1] = entry.count;
        });

        setChartData(monthly);
      } catch (error) {
        console.error("Chart Fetch Error:", error);
      }
    }

    fetchData();
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      type: "bar" as const, // <-- FIXED
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 4, colors: ["transparent"] },
    xaxis: {
      categories: [
        "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
      ],
    },
    tooltip: {
      y: {
        formatter: (val: number | undefined) => `${val ?? 0} Leads`,
      },
    },
  };

  const series = [
    {
      name: "Total Leads",
      data: chartData,
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" className="min-w-[1000px]">
        <ReactApexChart
          key={chartData.join(",")}
          options={options}
          series={series}
          type="bar"
          height={180}
        />
      </div>
    </div>
  );
}
