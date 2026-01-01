import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import { useNotificationsQuery } from '../hooks/useQueries';
import { useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useMutations';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  fetchNotifications: () => {},
  addNotification: () => {}
});

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: notificationsData, refetch } = useNotificationsQuery();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined);
  };

  const fetchNotifications = () => {
    refetch();
  };

  const addNotification = (notification: any) => {
    toast.info(notification.message);
    refetch();
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      fetchNotifications,
      addNotification 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};