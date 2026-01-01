import { format } from 'date-fns';
import { 
  Bell, 
  CheckCheck, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useNotificationsList } from '../hooks/useQueries';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const NotificationListPage = () => {
  const { data: notificationsData, isLoading: loading } = useNotificationsList(500);
  const allNotifications = notificationsData || [];
  const { markAsRead, markAllAsRead } = useNotifications();

  const handleMarkAsRead = (id: string, e: any) => {
    // Prevent navigation if clicking the mark as read button
    e?.stopPropagation();
    e?.preventDefault();
    
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'inventory_alert':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <Layout title="All Notifications">
        <div className="space-y-4 max-w-4xl mx-auto">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-start space-x-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                   <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-3 w-1/2" />
                </div>
             </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="All Notifications">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Bell className="text-blue-600" />
            All Notifications
          </h1>
          {allNotifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {allNotifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You're all caught up! Check back later for updates."
              icon={Bell}
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {allNotifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`group relative hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  {notification.link && (
                    <Link 
                      to={notification.link}
                      className="absolute inset-0 z-10"
                      onClick={!notification.read ? () => handleMarkAsRead(notification._id, null) : undefined}
                    />
                  )}
                  
                  <div className="relative p-4 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-gray-600 ml-7">{notification.message}</p>
                    </div>
                    
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="relative z-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-2 py-1 rounded hover:bg-blue-100"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationListPage;
