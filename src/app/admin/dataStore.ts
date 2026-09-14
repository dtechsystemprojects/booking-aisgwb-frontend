export interface UserRecord {
  id: string;
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  groupId: string;
  status: "Active" | "Inactive" | "Pending";
  twoFactorEnabled: boolean;
  joinedDate: string;
  password?: string;
  sex?: string;
  memberId?: string;
  username?: string;
}

export interface EventRecord {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string; // Using string for ISO dates
  endDate: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  registrationOpen?: string;
  registrationClose?: string;
  eventType: 'Offline' | 'Online' | 'Hybrid';
  venueLocation?: string;
  onlinePlatformUrl?: string;
  organizerId?: string;
  logo?: string;
  banner?: string;
  maximumSeats?: number;
  status: 'Draft' | 'Ongoing' | 'Upcoming' | 'Expired';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendeeRecord {
  [x: string]: any;
  id?: string;
  _id?: string;
  bookingId?: any;
  eventId: string | any;
  name: string;
  ticketId: string | any;
  ticketPrice: number;
  ticketStatus: 'Unused' | 'Used' | 'Cancelled';
  paymentStatus: 'Success' | 'Failed' | 'Pending';
  checkInTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserGroupRecord {
  id: string;
  name: string;
  description: string;
  badgeVariant:
    | "primary"
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "secondary";
  memberCount: number;
  status: "Active" | "Inactive";
  createdDate: string;
  permissionsCount: number;
}

export interface PermissionModuleAccess {
  id: string;
  moduleName: string;
  category: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  export: boolean;
  order?: number;
}

export interface GroupAccessPolicy {
  groupId: string;
  groupName: string;
  modules: PermissionModuleAccess[];
}

export const initialUserRecords: UserRecord[] = [
  {
    id: "USR-1",
    name: "Administrator",
    email: "admin@enterprise.io",
    mobile: "9876543210",
    avatar: "/images/users/avatar-1.jpg",
    groupId: "GRP-1",
    status: "Active",
    twoFactorEnabled: true,
    joinedDate: "Jan 12, 2024",
    sex: "Male",
    memberId: "MEM-001",
    username: "admin_user",
  },
];

export const initialUserGroups: UserGroupRecord[] = [
  {
    id: "GRP-1",
    name: "Super Admin",
    description:
      "Full system executive access with control over all modules, groups, security settings, and audit logs.",
    badgeVariant: "primary",
    memberCount: 3,
    status: "Active",
    createdDate: "Jan 01, 2024",
    permissionsCount: 28,
  },
  {
    id: "GRP-2",
    name: "Manager",
    description:
      "Department leads with access to manage team members, approve workflows, and export analytics.",
    badgeVariant: "success",
    memberCount: 8,
    status: "Active",
    createdDate: "Jan 15, 2024",
    permissionsCount: 20,
  },
  {
    id: "GRP-3",
    name: "Editor",
    description:
      "Content creators and marketing staff authorized to create, update, and publish digital assets.",
    badgeVariant: "info",
    memberCount: 12,
    status: "Active",
    createdDate: "Feb 10, 2024",
    permissionsCount: 14,
  },
];

export const initialModulePermissions: PermissionModuleAccess[] = [
  {
    id: "MOD-1",
    moduleName: "Users",
    category: "Administration",
    read: true,
    write: true,
    delete: true,
    export: true,
  },
  {
    id: "MOD-2",
    moduleName: "Groups",
    category: "Administration",
    read: true,
    write: true,
    delete: true,
    export: true,
  },
  {
    id: "MOD-3",
    moduleName: "Permissions",
    category: "Administration",
    read: true,
    write: true,
    delete: true,
    export: true,
  },
  {
    id: "MOD-4",
    moduleName: "Group Access",
    category: "Administration",
    read: true,
    write: true,
    delete: true,
    export: true,
  },
  {
    id: "MOD-5",
    moduleName: "Settings",
    category: "Administration",
    read: true,
    write: true,
    delete: true,
    export: true,
  },
  {
    id: "MOD-6",
    moduleName: "Attendees",
    category: "Administration",
    read: true,
    write: true,
    delete: true,
    export: true,
  },
];

export interface WebsiteSettingItem {
  id: string;
  displayName: string;
  key: string;
  type: "text" | "file" | "textarea" | "switch" | "select";
  group: string;
  value: string | boolean;
  previewUrl?: string;
  optionsData?: string;
}

export const initialWebsiteSettings: WebsiteSettingItem[] = [
  {
    id: "SET-1",
    displayName: "Website Title",
    key: "general.title",
    type: "text",
    group: "General",
    value: process.env.NEXT_PUBLIC_APP_NAME || "DTech System",
  },
  {
    id: "SET-2",
    displayName: "Website Logo",
    key: "general.logo",
    type: "file",
    group: "General",
    value: "/images/logo.png",
    previewUrl: "/images/logo.png",
  },
  {
    id: "SET-3",
    displayName: "Website Favicon",
    key: "general.favicon",
    type: "file",
    group: "General",
    value: "/images/logo.png",
    previewUrl: "/images/logo.png",
  },
  {
    id: "SET-4",
    displayName: "Support Email Address",
    key: "general.support_email",
    type: "text",
    group: "General",
    value: process.env.NEXT_PUBLIC_EMAIL || "info@gmail.com",
  },
  {
    id: "SET-5",
    displayName: "Maintenance Mode",
    key: "general.maintenance",
    type: "switch",
    group: "General",
    value: process.env.NEXT_PUBLIC_MAINTENANCE_MODE || false,
  },
  {
    id: "SET-6",
    displayName: "SEO Meta Description",
    key: "seo.meta_description",
    type: "textarea",
    group: "SEO",
    value: "DTech System - Premier IT Services and Software Solutions",
  },
  {
    id: "SET-7",
    displayName: "Google Analytics Property ID",
    key: "seo.ga_tracking_id",
    type: "text",
    group: "SEO",
    value: "G-XXXXXXX101",
  },
  {
    id: "SET-8",
    displayName: "SMTP Mail Host",
    key: "mail.smtp_host",
    type: "text",
    group: "Email / SMTP",
    value: process.env.EMAIL_HOST || "smtp.gmail.com",
  },
];

