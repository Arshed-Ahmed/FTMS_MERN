"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = exports.objectIdSchema = void 0;
const zod_1 = require("zod");
// Regex for MongoDB ObjectId (24 hex characters)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.objectIdSchema = zod_1.z.string().regex(objectIdRegex, {
    message: 'Invalid ObjectId',
});
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        nic: zod_1.z.string().min(1, 'NIC is required'),
        phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
        email: zod_1.z.string().email('Invalid email address'),
        address: zod_1.z.string().min(1, 'Address is required'),
    }),
});
exports.updateCustomerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: exports.objectIdSchema,
    }),
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required').optional(),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
        nic: zod_1.z.string().min(1, 'NIC is required').optional(),
        phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').optional(),
        email: zod_1.z.string().email('Invalid email address').optional(),
        address: zod_1.z.string().min(1, 'Address is required').optional(),
    }),
});
