import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  type LucideProps
} from 'lucide-react';

export interface IconProps extends LucideProps {
  size?: number;
}

export const DashboardIcon = LayoutDashboard;
export const UsersIcon = Users;
export const ProductsIcon = Package;
export const SettingsIcon = Settings;
export const LogoutIcon = LogOut;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const MenuIcon = Menu;