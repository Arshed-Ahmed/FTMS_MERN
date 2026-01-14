import { Request } from 'express';
import mongoose, { ClientSession } from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

interface AuditLogParams {
  req: AuthenticatedRequest | Request;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId | string;
  details?: any;
  session?: ClientSession;
}

export const logAudit = async ({
  req,
  action,
  entity,
  entityId,
  details,
  session,
}: AuditLogParams) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Only log if user is authenticated
    if (!authReq.user) {
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    const auditEntry = new AuditLog({
      user: authReq.user._id,
      action,
      entity,
      entityId,
      details,
      ipAddress,
      userAgent,
    });

    if (session) {
      await auditEntry.save({ session });
    } else {
      await auditEntry.save();
    }
  } catch (error) {
    console.error('Audit Log Error:', error);
    // Don't throw error to prevent blocking main flow
  }
};
