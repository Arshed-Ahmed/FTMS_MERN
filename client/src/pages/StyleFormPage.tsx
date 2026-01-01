import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { API_URL } from '../constants';
import { useStyle } from '../hooks/useQueries';
import { useCreateStyle, useUpdateStyle, useUploadStyleImage } from '../hooks/useMutations';

const StyleFormPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: style, isLoading: isLoadingStyle } = useStyle(id!);
  const createStyleMutation = useCreateStyle();
  const updateStyleMutation = useUpdateStyle();
  const uploadImageMutation = useUploadStyleImage();

  useEffect(() => {
    if (isEditMode && style) {
      setName(style.name);
      setDescription(style.description);
      setCategory(style.category || 'Other');
      setImage(style.image);
    }
  }, [isEditMode, style]);

  const uploadFileHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const imageUrl = await uploadImageMutation.mutateAsync(formData);
      setImage(imageUrl);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Image upload failed');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const styleData = {
        name,
        description,
        category,
        image,
      };

      if (isEditMode && id) {
        await updateStyleMutation.mutateAsync({ id, data: styleData });
        toast.success('Style updated successfully');
      } else {
        await createStyleMutation.mutateAsync(styleData);
        toast.success('Style added successfully');
      }
      navigate('/styles');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving style');
    }
  };

  if (isEditMode && isLoadingStyle) {
    return (
      <Layout title="Edit Style">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Style' : 'Add Style'}>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Style Name</label>
            <input
              type="text"
              required
              title="Style Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={category}
              title="Category"
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="Shirt">Shirt</option>
              <option value="Trouser">Trouser</option>
              <option value="Suit">Suit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              title="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
            <input
              type="text"
              required
              title="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
              placeholder="Enter image URL or upload below"
            />
            <input
              type="file"
              title="Upload Image"
              onChange={uploadFileHandler}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-300
                dark:hover:file:bg-blue-800"
            />
            {uploading && <div className="text-sm text-gray-500 mt-1">Uploading...</div>}
          </div>

          {image && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img src={`${API_URL}${image}`} alt="Preview" className="h-48 object-contain rounded border" />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/styles')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStyleMutation.isPending || updateStyleMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createStyleMutation.isPending || updateStyleMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Style' : 'Save Style')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StyleFormPage;
