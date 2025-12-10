import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Bell, Moon, Sun, User, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import { useMediaQuery } from '../../hooks/use-media-query';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Sidebar } from './Sidebar';
import './Header.css';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications] = useState([
    {
      id: 1,
      title: 'New assignment posted',
      description: 'Math 101: Homework 3 is now available',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Grade updated',
      description: 'Your grade for Science Quiz 2 has been posted',
      time: '1 day ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <header className="header">
      <div className="header-container">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mobile-menu-button">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <Sidebar className="w-full border-r-0" />
            </SheetContent>
          </Sheet>
        )}
        <div className="header-left">
          <Link to="/" className="header-logo">
            <span>College App</span>
          </Link>
        </div>
        <div className="header-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="header-icon-button"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="notification-button">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <div className="notification-header">
                <p className="text-sm font-medium">Notifications</p>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  Mark all as read
                </Button>
              </div>
              <div className="notification-list">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-item-header">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.read && <span className="unread-dot" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="notification-time">{notification.time}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="header-user-info">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="header-user-details">
              <p className="header-user-name">{user?.name || 'User'}</p>
              <p className="header-user-role">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

