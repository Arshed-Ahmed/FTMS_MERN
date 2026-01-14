import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SoftDeleteDocument extends Document {
  isDeleted: boolean;
  deletedAt?: Date | null;
  softDelete: () => Promise<this>;
  restore: () => Promise<this>;
}

export interface SoftDeleteModel<T extends Document> extends Model<T> {
  // Add any static methods here if needed
}

export const softDeletePlugin = (schema: Schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };
};

export default softDeletePlugin;
