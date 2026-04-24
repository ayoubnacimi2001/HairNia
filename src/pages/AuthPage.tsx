import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Settings, Eye, EyeOff } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function AuthPage() {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.email === 'admin@hairnia.com' || user.email === 'ayoubnacimi2001@gmail.com') {
        setIsAdmin(true);
      } else {
        getDoc(doc(db, 'admins', user.uid)).then(doc => {
          if (doc.exists()) setIsAdmin(true);
        }).catch(err => console.error("Error checking admin status:", err));
      }
    }
  }, [user]);

  const getEmail = (input: string) => {
    if (!input.includes('@')) {
      return `${input.toLowerCase()}@hairnia.com`;
    }
    return input;
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!emailOrUsername || !password) {
      setError('Please enter user ID/email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const emailToUse = getEmail(emailOrUsername);
    
    try {
      let result;
      let isNewUser = false;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, emailToUse, password);
        isNewUser = true;
      } else {
        result = await signInWithEmailAndPassword(auth, emailToUse, password);
      }
      
      const userDocRef = doc(db, 'users', result.user.uid);
      
      // Auto-assign admin if username is 'admin' OR if email is ayoubnacimi
      const isSpecialAdmin = emailOrUsername.toLowerCase() === 'admin' || emailToUse === 'ayoubnacimi2001@gmail.com' || emailToUse === 'admin@hairnia.com';
      
      if (isNewUser) {
        // Create user document in the database
        await setDoc(userDocRef, {
          email: emailToUse,
          name: emailOrUsername, // Use they input as name initially
          role: isSpecialAdmin ? 'admin' : 'user',
          authProvider: 'local',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      if (isSpecialAdmin) {
        try {
          await setDoc(doc(db, 'admins', result.user.uid), { 
            email: emailToUse, 
            createdAt: serverTimestamp() 
          });
          setIsAdmin(true);
        } catch (e) {
          console.error('Failed to set admin status:', e);
        }
      }
      
      navigate('/shop');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method and enable the "Email/Password" provider.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid User ID/Email or password. Please try again.');
        setPassword('');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this User ID/Email. Please select "Sign In" instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const isSpecialAdmin = result.user.email === 'ayoubnacimi2001@gmail.com' || result.user.email === 'admin@hairnia.com';
      
      if (!userDoc.exists()) {
        try {
          await setDoc(userDocRef, {
            email: result.user.email,
            name: result.user.displayName || 'Google User',
            role: isSpecialAdmin ? 'admin' : 'user',
            authProvider: 'google',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Failed to create user doc:", e);
        }
      }

      // Auto-setup admin for the specified email
      if (isSpecialAdmin) {
        try {
          await setDoc(doc(db, 'admins', result.user.uid), { 
            email: result.user.email, 
            createdAt: serverTimestamp() 
          });
          setIsAdmin(true);
        } catch (e) {
          console.error('Failed to set admin status:', e);
        }
      }
      
      navigate('/shop');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled');
      } else {
        setError(err.message || 'Failed to sign in');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border border-[var(--border)] bg-[var(--card)] shadow-2xl text-center">
        <div className="w-20 h-20 mx-auto overflow-hidden mb-6 border border-primary-500/50 p-1">
          <div className="w-full h-full pb-full relative bg-[var(--background)]">
            <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="absolute top-0 left-0 w-full h-full object-cover mix-blend-luminosity" />
          </div>
        </div>
        <h2 className="text-2xl font-serif italic mb-2">Welcome, {user.displayName}</h2>
        <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 mb-8">{user.email}</p>
        
        <div className="space-y-4 text-center">
           {isAdmin && (
             <Link 
               to="/admin"
               className="w-full py-4 border border-[var(--border)] text-[var(--foreground)] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary-400 transition-colors"
             >
               <Settings className="h-4 w-4" /> Admin Dashboard
             </Link>
           )}
           {!isAdmin && user.email === 'ayoubnacimi2001@gmail.com' && (
             <button 
               onClick={async () => {
                 try {
                   await doc(db, 'admins', user.uid); // just to show
                   // Actually we need to set it
                   const { setDoc, serverTimestamp } = await import('firebase/firestore');
                   await setDoc(doc(db, 'admins', user.uid), { email: user.email, createdAt: serverTimestamp() });
                   setIsAdmin(true);
                   alert('You are now an admin!');
                 } catch (err) {
                   console.error(err);
                 }
               }}
               className="w-full py-4 border border-primary-500 text-primary-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary-400 transition-colors"
             >
               Setup Admin Role
             </button>
           )}
           <button 
            onClick={handleLogout}
            className="w-full py-4 border border-[var(--border)] text-[var(--foreground)]/60 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--border)] hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-[var(--border)] bg-[var(--card)] shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif italic mb-2">My Account</h1>
        <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 leading-relaxed mt-4">Sign in to track orders, save your wishlist, and checkout faster.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 text-red-400 text-[10px] uppercase tracking-widest border border-red-500/50">
          {error}
        </div>
      )}

      <div className="space-y-4 text-center">
        <form onSubmit={(e) => { e.preventDefault(); handleEmailAuth(false); }} className="space-y-3">
          <input
            type="text"
            placeholder="Email or User ID"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-400 text-black font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleEmailAuth(true); }}
              disabled={loading}
              className="w-full py-4 border border-primary-400 text-primary-400 font-bold text-[10px] uppercase tracking-widest hover:bg-primary-400 hover:text-black transition-colors disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-[var(--card)] px-4 text-[var(--foreground)]/40">Or</span>
          </div>
        </div>

         <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-bold text-[10px] uppercase tracking-widest hover:border-primary-400 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? 'Continuing...' : 'Continue with Google'}
        </button>
        <p className="text-[9px] text-center text-[var(--foreground)]/40 uppercase tracking-widest mt-6">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
