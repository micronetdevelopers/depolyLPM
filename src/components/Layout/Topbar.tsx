import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import { useGetUserProfileQuery } from '../../features/services/apiSlice';

import { Menu, User, LogOut, Search, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { logout } from '../../features/store/authSlice';

export const Topbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { data: userProfile } = useGetUserProfileQuery();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notifications = [
    { id: 1, message: "New user registered" },
    { id: 2, message: "Server backup completed" },
    { id: 3, message: "New message from support" },
  ];

  const notificationRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-900 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
            Travel Admin Dashboard
          </h1> */}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3 relative">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                className="relative focus:outline-none"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <Bell className="w-6 h-6 text-gray-500 hover:text-primary-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="p-3 text-gray-500 text-sm">No notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif.id} className="p-3 hover:bg-gray-50 text-sm text-gray-800 border-b last:border-b-0">
                          {notif.message}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            {/* Existing user info and avatar */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{userProfile?.first_name || userProfile?.username || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{userProfile?.email || 'admin@travel.com'}</p>
            </div>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={() => dispatch(logout())}
            className="text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button> */}
        </div>
      </div>
    </header>
  );
};
