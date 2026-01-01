import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LayoutSkeleton from './components/LayoutSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CustomerListPage = lazy(() => import('./pages/CustomerListPage'));
const CustomerFormPage = lazy(() => import('./pages/CustomerFormPage'));
const CustomerProfilePage = lazy(() => import('./pages/CustomerProfilePage'));
const EmployeeListPage = lazy(() => import('./pages/EmployeeListPage'));
const EmployeeFormPage = lazy(() => import('./pages/EmployeeFormPage'));
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage'));
const StyleListPage = lazy(() => import('./pages/StyleListPage'));
const StyleFormPage = lazy(() => import('./pages/StyleFormPage'));
const OrderListPage = lazy(() => import('./pages/OrderListPage'));
const OrderFormPage = lazy(() => import('./pages/OrderFormPage'));
const MeasurementListPage = lazy(() => import('./pages/MeasurementListPage'));
const MeasurementFormPage = lazy(() => import('./pages/MeasurementFormPage'));
const JobListPage = lazy(() => import('./pages/JobListPage'));
const JobFormPage = lazy(() => import('./pages/JobFormPage'));
const CompanySettingsPage = lazy(() => import('./pages/CompanySettingsPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const UserListPage = lazy(() => import('./pages/UserListPage'));
const UserFormPage = lazy(() => import('./pages/UserFormPage'));
const ItemTypeListPage = lazy(() => import('./pages/ItemTypeListPage'));
const ItemTypeFormPage = lazy(() => import('./pages/ItemTypeFormPage'));
const MaterialListPage = lazy(() => import('./pages/MaterialListPage'));
const MaterialFormPage = lazy(() => import('./pages/MaterialFormPage'));
const MaterialProfilePage = lazy(() => import('./pages/MaterialProfilePage'));
const LookbookPage = lazy(() => import('./pages/LookbookPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const ServerDownPage = lazy(() => import('./pages/ServerDownPage'));
const TrashPage = lazy(() => import('./pages/TrashPage'));
const NotificationListPage = lazy(() => import('./pages/NotificationListPage'));
const SupplierListPage = lazy(() => import('./pages/SupplierListPage'));
const SupplierFormPage = lazy(() => import('./pages/SupplierFormPage'));
const PurchaseOrderListPage = lazy(() => import('./pages/PurchaseOrderListPage'));
const PurchaseOrderFormPage = lazy(() => import('./pages/PurchaseOrderFormPage'));
const PurchaseOrderReceivePage = lazy(() => import('./pages/PurchaseOrderReceivePage'));
const FinanceDashboardPage = lazy(() => import('./pages/FinanceDashboardPage'));

function App() {
  const [isServerDown, setIsServerDown] = useState(false);

  useEffect(() => {
    const handleServerDown = () => setIsServerDown(true);
    window.addEventListener('server-down', handleServerDown);
    return () => window.removeEventListener('server-down', handleServerDown);
  }, []);

  if (isServerDown) {
    return <ServerDownPage />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <Suspense fallback={<LayoutSkeleton />}>
              <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/lookbook" element={<LookbookPage />} />
            
            {/* Routes accessible to all logged-in users (Admin & Tailor) */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/customers/add" element={<CustomerFormPage />} />
              <Route path="/customers/:id" element={<CustomerProfilePage />} />
              <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
              <Route path="/styles" element={<StyleListPage />} />
              <Route path="/styles/add" element={<StyleFormPage />} />
              <Route path="/styles/:id/edit" element={<StyleFormPage />} />
              {/* <Route path="/lookbook" element={<LookbookPage />} /> Moved to public routes */}
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/add" element={<OrderFormPage />} />
              <Route path="/orders/:id/edit" element={<OrderFormPage />} />
              <Route path="/orders/:id/invoice" element={<InvoicePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/measurements" element={<MeasurementListPage />} />
              <Route path="/measurements/add" element={<MeasurementFormPage />} />
              <Route path="/measurements/:id/edit" element={<MeasurementFormPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/add" element={<JobFormPage />} />
              <Route path="/jobs/:id/edit" element={<JobFormPage />} />
              <Route path="/profile" element={<UserFormPage />} />
              <Route path="/notifications" element={<NotificationListPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Routes accessible ONLY to Admins */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/add" element={<EmployeeFormPage />} />
              <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
              <Route path="/company" element={<CompanySettingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/itemtypes" element={<ItemTypeListPage />} />
              <Route path="/itemtypes/add" element={<ItemTypeFormPage />} />
              <Route path="/itemtypes/:id/edit" element={<ItemTypeFormPage />} />
              <Route path="/materials" element={<MaterialListPage />} />
              <Route path="/materials/add" element={<MaterialFormPage />} />
              <Route path="/materials/:id" element={<MaterialProfilePage />} />
              <Route path="/materials/:id/edit" element={<MaterialFormPage />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/users/add" element={<UserFormPage />} />
              <Route path="/users/:id/edit" element={<UserFormPage />} />
              <Route path="/trash" element={<TrashPage />} />
              
              {/* ERP Modules */}
              <Route path="/suppliers" element={<SupplierListPage />} />
              <Route path="/suppliers/new" element={<SupplierFormPage />} />
              <Route path="/suppliers/edit/:id" element={<SupplierFormPage />} />
              
              <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
              <Route path="/purchase-orders/new" element={<PurchaseOrderFormPage />} />
              <Route path="/purchase-orders/:id/receive" element={<PurchaseOrderReceivePage />} />
              
              <Route path="/finance" element={<FinanceDashboardPage />} />
            </Route>
              </Routes>
              </Suspense>
              <ToastContainer />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
