import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { inventoryService } from '../services/inventoryService';
import { customerService } from '../services/customerService';
import { employeeService } from '../services/employeeService';
import { financeService } from '../services/financeService';
import { authService } from '../services/authService';
import { statsService } from '../services/statsService';
import { jobService } from '../services/jobService';
import { styleService } from '../services/styleService';
import { measurementService } from '../services/measurementService';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { companyService } from '../services/companyService';
import { trashService } from '../services/trashService';
import { paymentService } from '../services/paymentService';

// Auth
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  });
};

// Orders
export const useOrders = (params?: any) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getAll(params),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};

export const useTrackOrder = (id: string) => {
  return useQuery({
    queryKey: ['trackOrder', id],
    queryFn: () => orderService.trackOrder(id),
    enabled: !!id,
  });
};

// Inventory
export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: inventoryService.getMaterials,
  });
};

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => inventoryService.getMaterialById(id),
    enabled: !!id,
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: inventoryService.getSuppliers,
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => inventoryService.getSupplierById(id),
    enabled: !!id,
  });
};

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: inventoryService.getPurchaseOrders,
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: ['purchaseOrders', id],
    queryFn: () => inventoryService.getPurchaseOrderById(id),
    enabled: !!id,
  });
};

export const useItemTypes = () => {
  return useQuery({
    queryKey: ['itemTypes'],
    queryFn: inventoryService.getItemTypes,
  });
};

export const useItemType = (id: string) => {
  return useQuery({
    queryKey: ['itemTypes', id],
    queryFn: () => inventoryService.getItemTypeById(id),
    enabled: !!id,
  });
};

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
};

// Employees
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
};

// Finance
export const useFinanceSummary = () => {
  return useQuery({
    queryKey: ['financeSummary'],
    queryFn: financeService.getSummary,
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: financeService.getTransactions,
  });
};

// Stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: statsService.getDashboardStats,
  });
};

// Jobs
export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: jobService.getAll,
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
};

// Styles
export const useStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: styleService.getAll,
  });
};

export const useStyle = (id: string) => {
  return useQuery({
    queryKey: ['styles', id],
    queryFn: () => styleService.getById(id),
    enabled: !!id,
  });
};

// Measurements
export const useMeasurements = (customerId: string) => {
  return useQuery({
    queryKey: ['measurements', customerId],
    queryFn: () => measurementService.getByCustomerId(customerId),
    enabled: !!customerId,
  });
};

export const useMeasurement = (id: string) => {
  return useQuery({
    queryKey: ['measurements', id],
    queryFn: () => measurementService.getById(id),
    enabled: !!id,
  });
};

export const useAllMeasurements = () => {
  return useQuery({
    queryKey: ['measurements'],
    queryFn: measurementService.getAll,
  });
};

// Users (Admin)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: userService.getProfile,
  });
};

// Notifications
export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useNotificationsList = (limit: number = 500) => {
  return useQuery({
    queryKey: ['notifications', { limit }],
    queryFn: () => notificationService.getAll(limit),
  });
};

// Company Settings
export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['companySettings'],
    queryFn: companyService.getSettings,
  });
};

// Trash
export const useTrash = () => {
  return useQuery({
    queryKey: ['trash'],
    queryFn: trashService.getAll,
  });
};

export const useRestoreTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) => trashService.restore(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
  });
};

export const useDeleteTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) => trashService.permanentDelete(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
  });
};

export const useEmptyTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trashService.emptyTrash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
  });
};

// Payments
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (orderId: string) => paymentService.createPaymentIntent(orderId),
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentIntentId }: { orderId: string; paymentIntentId: string }) => 
      paymentService.confirmPayment(orderId, paymentIntentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

