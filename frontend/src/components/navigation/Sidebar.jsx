import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  Bus,
  ClipboardList,
  Trophy,
  Award,
  User,
  LogOut,
} from 'lucide-react';
import './Sidebar.css';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Timetable',
    href: '/timetable',
    icon: Clock,
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: Calendar,
  },
  {
    title: 'Notes',
    href: '/notes',
    icon: FileText,
  },
  {
    title: 'Bus Tracking',
    href: '/bus-tracking',
    icon: Bus,
  },
  {
    title: 'Assignments',
    href: '/assignments',
    icon: ClipboardList,
  },
  {
    title: 'Results',
    href: '/results',
    icon: Trophy,
  },
  {
    title: 'Achievements',
    href: '/achievements',
    icon: Award,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
];

function SidebarLogout() {
  const { logout } = useAuth();
  return (
    <Button
      variant="ghost"
      className="sidebar-logout"
      onClick={logout}
    >
      <LogOut className="sidebar-icon" />
      Logout
    </Button>
  );
}

export function Sidebar({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href) => {
    navigate(href);
  };

  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <Button
            variant="ghost"
            className="sidebar-logo-button"
            onClick={() => handleNavigation('/')}
          >
            <span className="sidebar-logo">College App</span>
          </Button>
        </div>
        <ScrollArea className="sidebar-scroll">
          <div className="sidebar-items">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="sidebar-icon" />
                  {item.title}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        <div className="sidebar-footer">
          <SidebarLogout />
        </div>
      </div>
    </div>
  );
}

