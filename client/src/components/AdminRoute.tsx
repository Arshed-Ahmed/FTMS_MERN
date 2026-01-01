import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const AdminRoute = () => {
  const { userInfo } = useAuth();

  useEffect(() => {
    if (userInfo && userInfo.role !== 'Admin') {
      toast.error('Access denied. Admin privileges required.');
    }
  }, [userInfo]);

  return userInfo && userInfo.role === 'Admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
