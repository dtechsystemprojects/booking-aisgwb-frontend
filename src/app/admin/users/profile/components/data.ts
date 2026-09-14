import user10 from "@/assets/images/users/user-10.jpg";
import user2 from "@/assets/images/users/user-2.jpg";
import user from "@/assets/images/users/user-7.jpg";
import user8 from "@/assets/images/users/user-8.jpg";
import user9 from "@/assets/images/users/user-9.jpg";
import { StaticImageData } from "next/image";

export const skillData: string[] = [
  "Product Design",
  "UI/UX",
  "Tailwind CSS",
  "Bootstrap",
  "React.js",
  "Next.js",
  "Vue.js",
  "Figma",
  "Design Systems",
  "Template Authoring",
  "Responsive Design",
  "Component Libraries",
];

export type TimelineItemType = {
  title: string;
  description: string;
  company: string;
  yearRange: string;
  bulletClassName: string;
};

export const timelineData: TimelineItemType[] = [
  {
    yearRange: "2023 – Present",
    title: "Lead UI Developer",
    description:
      "Developing scalable and reusable UI components for SaaS dashboards using React, Tailwind CSS, and TypeScript.",
    company: "CraftCode Studio",
    bulletClassName: "bg-primary",
  },
  {
    yearRange: "2021 – 2023",
    title: "Frontend Engineer",
    description:
      "Built modern, responsive admin templates and UI kits using Vue, Bootstrap 5, and Laravel Blade.",
    company: "CodeNova",
    bulletClassName: "bg-success",
  },
  {
    yearRange: "2019 – 2021",
    title: "UI/UX Designer & Developer",
    description:
      "Designed and developed dashboard layouts and admin panel concepts, focusing on accessibility and performance.",
    company: "Freelancer",
    bulletClassName: "bg-warning",
  },
  {
    yearRange: "2017 – 2019",
    title: "Web Designer",
    description:
      "Created responsive HTML/CSS templates and themes for clients in eCommerce and portfolio niches.",
    company: "PixelFrame Agency",
    bulletClassName: "bg-info",
  },
  {
    yearRange: "2015 – 2017",
    title: "Junior Frontend Developer",
    description:
      "Maintained and updated legacy UI projects, gaining hands-on experience in HTML, CSS, jQuery, and Bootstrap 3.",
    company: "DevLaunch",
    bulletClassName: "bg-secondary",
  },
];

export type TaskType = {
  title: string;
  due: string;
  status: "in-progress" | "completed" | "on-hold" | "outdated";
  user: {
    name: string;
    email: string;
    image: StaticImageData;
  };
  startDate: string;
  priority: "high" | "medium" | "low";
  progress: string;
  time: string;
};

export const taskData: TaskType[] = [
  {
    title: "Blazor Admin Theme – Final QA",
    due: "Due in 3 days",
    status: "in-progress",
    user: {
      name: "Jordan Walsh",
      email: "jordan@uxlabs.io",
      image: user,
    },
    startDate: "Jul 20, 2025",
    priority: "high",
    progress: "60%",
    time: "9h 10min",
  },
  {
    title: "Vue 3 UI Kit Refactor",
    due: "Due in 8 days",
    status: "completed",
    user: {
      name: "Emily Foster",
      email: "emily@devspark.pro",
      image: user8,
    },
    startDate: "Jul 10, 2025",
    priority: "low",
    progress: "100%",
    time: "27h 20min",
  },
  {
    title: "HTML Email Templates Pack",
    due: "Due in 1 day",
    status: "in-progress",
    user: {
      name: "Ella Newman",
      email: "ella@mailgenius.app",
      image: user9,
    },
    startDate: "Jul 18, 2025",
    priority: "medium",
    progress: "55%",
    time: "5h 40min",
  },
  {
    title: "Bootstrap 5 Theme Migration",
    due: "Due in 6 days",
    status: "on-hold",
    user: {
      name: "Daniel Rhodes",
      email: "daniel@uideck.net",
      image: user10,
    },
    startDate: "Jul 16, 2025",
    priority: "low",
    progress: "25%",
    time: "4h 15min",
  },
  {
    title: "SaaS Dashboard: UX Testing",
    due: "Due in 9 days",
    status: "outdated",
    user: {
      name: "Leo Patterson",
      email: "leo@uxcore.studio",
      image: user2,
    },
    startDate: "Jul 05, 2025",
    priority: "high",
    progress: "20%",
    time: "12h 30min",
  },
];
