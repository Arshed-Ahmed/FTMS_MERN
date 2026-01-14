export const softDeletePlugin = (schema) => {
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
