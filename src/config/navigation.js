import {
  Home,
  Ticket,
  ClipboardList,
  ScrollText,
  TriangleAlert,
  UserRound,
  ScanLine,
  Search,
  Clock3,
} from 'lucide-react';

export const userNav = [
  { to: '/user/home', labelKey: 'nav.home', icon: Home },
  { to: '/user/my-pass', labelKey: 'nav.myPass', icon: Ticket },
  { to: '/user/my-visits', labelKey: 'nav.myVisits', icon: ClipboardList },
  { to: '/user/beach-rules', labelKey: 'nav.beachRules', icon: ScrollText },
  { to: '/user/report', labelKey: 'nav.reportIssue', icon: TriangleAlert },
  { to: '/user/profile', labelKey: 'nav.profile', icon: UserRound },
];

export const adminNav = [
  { to: '/admin/scan', labelKey: 'nav.scan', icon: ScanLine },
  { to: '/admin/search', labelKey: 'nav.search', icon: Search },
  { to: '/admin/recent', labelKey: 'nav.recent', icon: Clock3 },
  { to: '/admin/reports', labelKey: 'nav.reports', icon: TriangleAlert },
  { to: '/admin/profile', labelKey: 'nav.profile', icon: UserRound },
];
