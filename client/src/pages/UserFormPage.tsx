import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Upload, X, Lock, User } from 'lucide-react';
import Layout from '../components/Layout';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_URL } from '../constants';
import { useUser, useUserProfile } from '../hooks/useQueries';
import { useCreateUser, useUpdateUser, useUpdateUserProfile, useUploadUserAvatar } from '../hooks/useMutations';

interface UserData {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar: string;
}

const UserFormPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Tailor');
  const [status, setStatus] = useState('Active');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const isProfileMode = location.pathname === '/profile';
  const isEditMode = !!id || isProfileMode;

  const { data: userProfile } = useUserProfile();
  const { data: userById } = useUser(id || '');
  
  const userData = isProfileMode ? userProfile : userById;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const updateUserProfileMutation = useUpdateUserProfile();
  const uploadAvatarMutation = useUploadUserAvatar();

  useEffect(() => {
    if (isEditMode && userData) {
      setUsername(userData.username);
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setRole(userData.role);
      setStatus(userData.status || 'Active');
      setAvatar(userData.avatar || '');
    }
  }, [isEditMode, userData]);

  const uploadFileHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const avatarUrl = await uploadAvatarMutation.mutateAsync(formData);
      setAvatar(avatarUrl);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Image upload failed');
    }
  };

  const handleDeleteAvatar = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAvatar = () => {
    setAvatar('');
    setIsDeleteModalOpen(false);
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const payload: any = {
        username,
        email,
        phone,
        role,
        status,
        avatar,
      };
      
      if (password) {
        payload.password = password;
      }

      if (isProfileMode) {
        await updateUserProfileMutation.mutateAsync(payload);
        toast.success('Profile updated successfully');
        setPassword('');
        setConfirmPassword('');
      } else if (isEditMode && id) {
        await updateUserMutation.mutateAsync({ id, data: payload });
        toast.success('User updated successfully');
        navigate('/users');
      } else {
        if (!password) {
            toast.error('Password is required for new users');
            return;
        }
        await createUserMutation.mutateAsync(payload);
        toast.success('User created successfully');
        navigate('/users');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving user');
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending || updateUserProfileMutation.isPending;

  return (
    <Layout title={isProfileMode ? 'User Settings' : (isEditMode ? 'Edit User' : 'New User')}>
      <div className="max-w-2xl mx-auto">
        {!isProfileMode && (
          <button
            onClick={() => navigate('/users')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          {!isProfileMode && (
             <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center">
               <User className="w-5 h-5 text-gray-500 dark:text-gray-300 mr-2" />
               <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Information</h3>
             </div>
          )}
          
          <form onSubmit={submitHandler} className="p-6 space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg">
                  {avatar ? (
                    <img 
                      src={avatar.startsWith('http') ? avatar : `${API_URL}${avatar}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Upload className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    title="Upload Profile Picture"
                    className="hidden"
                    onChange={uploadFileHandler}
                    accept="image/*"
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-colors z-10"
                    title="Remove photo"
                  >
                    <X size={16} />
                  </button>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {uploading ? 'Uploading...' : 'Click camera icon to upload photo'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  title="Username"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  title="Email Address"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  title="Phone Number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  title="Role"
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${isProfileMode ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-700 text-gray-500' : ''}`}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isProfileMode}
                >
                  <option value="Tailor">Tailor</option>
                  <option value="Admin">Admin</option>
                </select>
                {isProfileMode && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Role cannot be changed.</p>}
              </div>

              {!isProfileMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    title="Status"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Disable">Disable</option>
                  </select>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                {isProfileMode ? 'Change Password' : 'Set Password'}
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isEditMode ? 'New Password' : 'Password'}
                  </label>
                  <input
                    type="password"
                    title="Password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEditMode}
                    placeholder={isEditMode ? "Leave blank to keep current" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    title="Confirm Password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteAvatar}
        title="Remove Profile Picture"
        message="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove"
        isDangerous={true}
      />
    </Layout>
  );
};

export default UserFormPage;
