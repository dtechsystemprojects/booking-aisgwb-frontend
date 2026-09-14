import { StaticImageData } from "next/image";

import user1 from "@/assets/images/users/user-1.jpg";
import user2 from "@/assets/images/users/user-2.jpg";
import user3 from "@/assets/images/users/user-3.jpg";
import user4 from "@/assets/images/users/user-4.jpg";
import user5 from "@/assets/images/users/user-5.jpg";

export type ServiceType = {
  icon: string;
  title: string;
  description: string;
};

export const serviceData: ServiceType[] = [
  {
    icon: "tabler:bulb",
    title: "Strategic Consulting",
    description:
      "We help businesses define clear digital goals and create custom strategies that align with long-term success. From planning to execution.",
  },
  {
    icon: "tabler:chart-bar",
    title: "SEO & Traffic Growth",
    description:
      "Boost your search visibility and drive organic traffic with our comprehensive SEO services — including keyword strategy, technical audits, etc.",
  },
  {
    icon: "tabler:speakerphone",
    title: "Social Media Management",
    description: `Elevate your brand's presence with targeted content, community engagement, and performance analytics across platforms like Instagram, Facebook, etc.`,
  },
  {
    icon: "tabler:world",
    title: "Custom Web Development",
    description:
      "We build modern, scalable websites and applications tailored to your business needs — optimized for speed, mobile responsiveness.",
  },
  {
    icon: "tabler:brush",
    title: "Brand Identity & Design",
    description:
      "From logos to full brand systems, we create memorable visual identities that express your values and connect with your target audience.",
  },
  {
    icon: "tabler:report-analytics",
    title: "Analytics & Insights",
    description:
      "Turn data into decisions with real-time dashboards, performance reports, and analytics solutions that help you measure success.",
  },
];

export type StateType = {
  value: number;
  suffix: string;
  label: string;
};

export const stats1: StateType[] = [
  { value: 98.6, suffix: "%", label: "Customer satisfaction" },
  { value: 10.2, suffix: "x", label: "Productivity boost" },
  { value: 3500, suffix: "+", label: "Businesses using UBold" },
];
export const stats2: StateType[] = [
  { value: 97.8, suffix: "%", label: "Task automation efficiency" },
  { value: 4.5, suffix: "x", label: "Faster admin operations" },
];

export type PricingPlanType = {
  name: string;
  price: number;
  description: string;
  title: string;
  features: {
    title: string;
    included: boolean;
  }[];
  btnClass: string;
  isPopular?: boolean;
};

export const pricingData: PricingPlanType[] = [
  {
    name: "Starter Plan",
    price: 9,
    description: "Best for freelancers and personal use",
    title: "1 project included",
    btnClass: "btn-outline-primary",
    isPopular: false,
    features: [
      { title: "1 active project", included: true },
      { title: "Access to all components", included: true },
      { title: "Email support", included: true },
      { title: "No team collaboration", included: false },
      { title: "No SaaS rights", included: false },
    ],
  },
  {
    name: "Professional",
    price: 29,
    description: "Ideal for small teams and startups",
    title: "Up to 5 projects",
    btnClass: "btn-light",
    isPopular: true,
    features: [
      { title: "5 active projects", included: true },
      { title: "Component + plugin access", included: true },
      { title: "Team collaboration", included: true },
      { title: "Priority email support", included: true },
      { title: "No resale rights", included: false },
    ],
  },
  {
    name: "Business",
    price: 79,
    description: "For agencies and large teams",
    title: "Unlimited projects",
    btnClass: "btn-dark",
    isPopular: false,
    features: [
      { title: "Unlimited projects", included: true },
      { title: "SaaS & client projects allowed", included: true },
      { title: "All premium components", included: true },
      { title: "Priority support", included: true },
      { title: "Team management tools", included: true },
    ],
  },
];

export type TestimonialType = {
  avatar: StaticImageData;
  name: string;
  title: string;
  description: string;
};

export const testimonials: TestimonialType[] = [
  {
    avatar: user1,
    name: "Michael Roberts",
    title: "Fantastic experience!",
    description: `"The admin dashboard is intuitive, fast, and packed with useful features. Highly recommend it!"`,
  },
  {
    avatar: user2,
    name: "Sarah Mitchell",
    title: "Excellent quality & support",
    description: `"The template’s quality is top-notch and the support team is quick to help. A truly seamless experience!"`,
  },
  {
    avatar: user3,
    name: "David Anderson",
    title: "Outstanding experience",
    description: `"Everything from setup to customization was smooth and easy. The support team went above and beyond!"`,
  },
  {
    avatar: user4,
    name: "James Whitman",
    title: "Highly impressed",
    description:
      "The performance and features are unmatched in this price range. Highly impressed!",
  },
  {
    avatar: user5,
    name: "Aisha Khan",
    title: "Smooth experience from start to finish",
    description:
      "The website, shipping, and support all worked flawlessly. Very satisfied!",
  },
];

export type footerLinksType = {
  title: string;
  links: {
    name: string;
    url: string;
    badge?: {
      title: string;
      variant: string;
    };
  }[];
};

export const footerLinks: footerLinksType[] = [
  {
    title: "Company",
    links: [
      { name: "Our Story", url: "" },
      { name: "Leadership Team", url: "" },
      {
        name: "Careers",
        url: "",
        badge: { title: "We're Hiring", variant: "warning" },
      },
      { name: "Press & Media", url: "" },
      { name: "Investor Relations", url: "" },
      { name: "Sustainability", url: "" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Community Forum", url: "" },
      { name: "Events & Meetups", url: "" },
      { name: "Ambassadors", url: "" },
      { name: "Customer Stories", url: "" },
      { name: "Open Source", url: "" },
      { name: "Code of Conduct", url: "" },
    ],
  },
  {
    title: "Admin",
    links: [
      { name: "Dashboard", url: "" },
      { name: "User Management", url: "" },
      { name: "Roles & Permissions", url: "" },
      { name: "System Logs", url: "" },
      { name: "Settings", url: "" },
      { name: "API Access", url: "" },
    ],
  },
];

export type socialLinksType = {
  title: string;
  icon: string;
  url: string;
};

export const socialLinks: socialLinksType[] = [
  { title: "Facebook", icon: "lucide:facebook", url: "" },
  { title: "Twitter-x", icon: "tabler:brand-x", url: "" },
  { title: "Instagram", icon: "lucide:instagram", url: "" },
  { title: "Dribbble", icon: "lucide:dribbble", url: "" },
];
