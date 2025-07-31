//Apps Links Type & Data
interface appsLinkType {
  href: string;
  title: string;
  subtext: string;
  icon: string;
  iconbg: string;
  iconcolor: string;
}

const appsLink: appsLinkType[] = [
  {
    href: "/apps/chats",
    title: "Chat Application",
    subtext: "New messages arrived",
    icon: "solar:chat-line-bold-duotone",
    iconbg: "bg-lightprimary",
    iconcolor: "text-primary",
  },
  {
    href: "/apps/ecommerce/shop",
    title: "eCommerce App",
    subtext: "New stock available",
    icon: "solar:widget-6-bold-duotone",
    iconbg: "bg-lightsecondary",
    iconcolor: "text-secondary",
  },
];

interface LinkType {
  href: string;
  title: string;
}

const pageLinks: LinkType[] = [
  {
    href: "/theme-pages/pricing",
    title: "Pricing Page",
  },
  {
    href: "/auth/auth1/login",
    title: "Authentication Design",
  }
];

//   Search Data
interface SearchType {
  href: string;
  title: string;
}

const SearchLinks: SearchType[] = [
  {
    title: "Analytics",
    href: "/dashboards/analytics",
  },
];

//   Notification Data
interface NotificationType {
  title: string;
  icon: any;
  subtitle: string;
  bgcolor: string;
  color: string;
  time: string;
}

const Notification: NotificationType[] = [
  {
    icon: "solar:widget-3-line-duotone",
    bgcolor: "bg-lighterror dark:bg-lighterror",
    color: "text-error",
    title: "Launch Admin",
    subtitle: "Just see the my new admin!",
    time: "9:30 AM",
  },
  {
    icon: "solar:calendar-line-duotone",
    bgcolor: "bg-lightprimary dark:bg-lightprimary",
    color: "text-primary",
    title: "Event Today",
    subtitle: "Just a reminder that you have event",
    time: "9:15 AM",
  },
];

//  Profile Data
interface ProfileType {
  title: string;
  url: string;
}

const profileDD: ProfileType[] = [
  {
    title: "My Profile",
    url: "/apps/user-profile/profile",
  },
  {
    title: "Account Settings",
    url: "/theme-pages/account-settings",
  },
  {
    title: "Sign Out",
    url: "/auth/auth2/login",
  },
];

export { appsLink, pageLinks, SearchLinks, Notification, profileDD };
