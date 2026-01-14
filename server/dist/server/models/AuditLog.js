import mongoose, { Schema } from 'mongoose';
const auditLogSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    entity: {
        type: String,
        required: true,
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: Schema.Types.Mixed,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, {
    timestamps: true,
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
