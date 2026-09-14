"use client";
import dynamic from "next/dynamic";

const Flatpickr = dynamic(() => import("react-flatpickr"), { ssr: false });

export default Flatpickr;
