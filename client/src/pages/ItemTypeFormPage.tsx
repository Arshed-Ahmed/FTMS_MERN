import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { useItemType } from '../hooks/useQueries';
import { useCreateItemType, useUpdateItemType, useUploadItemTypeImage } from '../hooks/useMutations';

interface ItemType {
  _id: string;
  name: string;
  fields: string[];
  image?: string;
}

const ItemTypeFormPage = () => {
  const [name, setName] = useState('');
  const [fields, setFields] = useState<string[]>(['']);
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { data: itemType, isLoading } = useItemType(id || '');
  const createItemTypeMutation = useCreateItemType();
  const updateItemTypeMutation = useUpdateItemType();
  const uploadImageMutation = useUploadItemTypeImage();

  useEffect(() => {
    if (itemType) {
      setName(itemType.name);
      setFields(itemType.fields.length > 0 ? itemType.fields : ['']);
      setImage(itemType.image || '');
    }
  }, [itemType]);

  const uploadFileHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const data = await uploadImageMutation.mutateAsync(formData);
      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Image upload failed');
    }
  };

  const handleSaveAsCopy = async () => {
     // Filter out empty fields
    const validFields = fields.filter(f => f.trim() !== '');
    
    if (validFields.length === 0) {
      toast.error('Please add at least one measurement field');
      return;
    }

    try {
      const payload = {
        name: `${name} (Copy)`,
        fields: validFields,
        image
      };

      await createItemTypeMutation.mutateAsync(payload);
      toast.success('Item Type cloned successfully');
      navigate('/itemtypes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error cloning item type');
    }
  };

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, '']);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.length ? newFields : ['']);
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    
    // Filter out empty fields
    const validFields = fields.filter(f => f.trim() !== '');
    
    if (validFields.length === 0) {
      toast.error('Please add at least one measurement field');
      return;
    }

    try {
      const payload = {
        name,
        fields: validFields,
        image
      };

      if (isEditMode) {
        await updateItemTypeMutation.mutateAsync({ id: id!, data: payload });
        toast.success('Item Type updated successfully');
      } else {
        await createItemTypeMutation.mutateAsync(payload);
        toast.success('Item Type created successfully');
      }
      navigate('/itemtypes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving item type');
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Layout title="Edit Template">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Template' : 'New Template'}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/itemtypes')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <form onSubmit={submitHandler}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                placeholder="e.g., Shirt, Trousers, Suit"
                title="Template Name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visual Guide Image (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  {image ? (
                    <img src={image} alt="Visual Guide" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">No image</span>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-4 inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" title="Upload Image" className="hidden" onChange={uploadFileHandler} accept="image/*" disabled={uploading} />
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Upload a diagram showing measurement points.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Measurement Fields
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add the specific measurements needed for this type of clothing (e.g., Neck, Chest, Waist).
              </p>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Measurement ${index + 1}`}
                      title={`Measurement Field ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      value={field}
                      onChange={(e) => handleFieldChange(index, e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addField}
                className="mt-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Measurement Field
              </button>
            </div>

            <div className="flex justify-end pt-6 border-t space-x-4">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleSaveAsCopy}
                  disabled={createItemTypeMutation.isPending}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {createItemTypeMutation.isPending ? 'Cloning...' : 'Save as Copy'}
                </button>
              )}
              <button
                type="submit"
                disabled={createItemTypeMutation.isPending || updateItemTypeMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {createItemTypeMutation.isPending || updateItemTypeMutation.isPending ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ItemTypeFormPage;
