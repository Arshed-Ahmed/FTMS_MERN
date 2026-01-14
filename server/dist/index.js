import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import styleRoutes from './routes/styleRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import itemTypeRoutes from './routes/itemTypeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import trashRoutes from './routes/trashRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// CORS Configuration (Must be before other middleware)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
})); // Set security headers with CORS support
// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(mongoSanitize()); // Prevent NoSQL injection
// app.use(xss()); // Prevent XSS attacks (Temporarily disabled as it may cause issues with Express 5)
app.use(hpp()); // Prevent HTTP Param Pollution
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/itemtypes', itemTypeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/finance', financeRoutes);
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
export default app;
