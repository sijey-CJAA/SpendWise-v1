import { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error: any) {
      alert(`Authentication Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 justify-center items-center px-8">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 border border-slate-800">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex justify-center items-center mb-6 shadow-lg shadow-blue-500/20 border border-slate-700">
            <span className="text-3xl font-extrabold text-blue-500">SW</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">{isLoginMode ? 'Welcome Back!' : 'Create Account'}</h1>
          <p className="text-base text-slate-400 text-center">{isLoginMode ? 'Sign in to manage your finances.' : 'Join SpendWise to track expenses.'}</p>
        </div>

        <div className="mb-8">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-blue-400 mb-2">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-800 h-14 rounded-2xl px-4 text-base text-white border border-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-blue-400 mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-slate-800 h-14 rounded-2xl px-4 text-base text-white border border-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end mb-8">
            <button className="text-blue-500 font-semibold text-sm hover:text-blue-400 transition-colors">Forgot Password?</button>
          </div>

          <button 
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 h-14 rounded-2xl flex justify-center items-center shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="text-white font-semibold">Loading...</span>
            ) : (
              <span className="text-white text-lg font-bold tracking-wide">{isLoginMode ? 'Login' : 'Sign Up'}</span>
            )}
          </button>
        </div>
        
        <div className="flex justify-center items-center gap-1">
          <span className="text-slate-400 text-base">{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
          <button 
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-500 text-base font-bold hover:text-blue-400 transition-colors"
          >
            {isLoginMode ? 'Sign up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
