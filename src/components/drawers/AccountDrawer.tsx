import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Loader2, LogOut, ChevronRight } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { Overlay } from '../Overlay';
import { auth } from '../../firebase';
import { avatarError, uploadAvatar } from '../../avatar';
import { useToast } from '../Toast';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
}

export const AccountDrawer = ({ isOpen, onClose, user }: AccountDrawerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  // updateProfile() changes user.photoURL in place without a re-render, so keep the new URL here.
  const [uploadedPhoto, setUploadedPhoto] = useState<{ uid: string; url: string } | null>(null);
  const notify = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) onClose();
    } catch (error: any) {
      console.error('Sign in failed:', error);
      if (error.code === 'auth/popup-blocked') {
        notify('Please allow pop-ups for this site to sign in.', 'error');
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        notify('Sign-in failed. Please try again.', 'error');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleProfileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    const fileError = avatarError(file);
    if (fileError) {
      notify(fileError, 'error');
      return;
    }
    setIsUploading(true);
    try {
      setUploadedPhoto({ uid: user.uid, url: await uploadAvatar(user, file) });
      notify('Profile photo updated.', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      notify('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const photoURL = user && uploadedPhoto?.uid === user.uid ? uploadedPhoto.url : user?.photoURL;

  return (
    <Overlay isOpen={isOpen} onClose={onClose} title="Account">
      {!user ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <User size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Welcome to NexCart</h3>
          <p className="text-gray-500 mb-8 text-sm">Sign in to track orders, save your wishlist, and manage your profile.</p>
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5 bg-white rounded-full p-0.5" />
            Continue with Google
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader2 className="animate-spin text-black" />
                  </div>
                ) : !photoURL ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <User size={40} aria-hidden="true" />
                  </div>
                ) : (
                  <img
                    src={photoURL}
                    alt="Profile"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <Camera size={16} />
                <span className="sr-only">Change profile photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={isUploading} />
              </label>
            </div>
            <h3 className="mt-4 text-xl font-bold">{user.displayName}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Member Since</p>
              <p className="text-sm font-medium">{new Date(user.metadata.creationTime || '').toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              navigate('/profile');
            }}
            className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            View Full Profile <ChevronRight size={16} />
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-4 border border-red-100 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}
    </Overlay>
  );
};
