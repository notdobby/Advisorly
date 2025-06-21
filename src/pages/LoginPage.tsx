import React, { useEffect, useState } from 'react';
import { LockIcon, ShieldIcon, FingerprintIcon } from 'lucide-react';
import { signInWithGoogle } from '../../frontend/auth';

const LoginPage: React.FC = () => {
  const [scannerAngle, setScannerAngle] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseOpacity, setPulseOpacity] = useState(0.5);
  const [loading, setLoading] = useState(false);

  // Rotate scanner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScannerAngle(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseOpacity(prev => prev === 0.5 ? 0.7 : 0.5);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      alert('Google login failed: ' + ((error as any)?.message || JSON.stringify(error)));
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract styles to variables to avoid Vite plugin issues
  const pulseStyle = {
    background: `radial-gradient(circle, rgba(99, 102, 241, ${pulseOpacity}) 0%, rgba(13, 17, 23, 0) 70%)`
  };

  const scannerStyle = {
    transform: `rotate(${scannerAngle}deg)`,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  };

  const scanEffectStyle = {
    background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3), transparent)',
    backgroundSize: '200% 100%',
    animation: isHovered ? 'scanEffect 1.5s infinite' : 'none'
  };

  const ringStyle = {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    transform: `rotate(${scannerAngle}deg)`
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0D1117] px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Fingerprint watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
          <FingerprintIcon size={500} />
        </div>
        {/* Gradient pulses */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full transition-opacity duration-1500" 
          style={pulseStyle}
        />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-indigo-900/30 flex items-center justify-center">
              <LockIcon size={36} className="text-indigo-400" />
            </div>
            <div 
              className="absolute inset-0 rounded-full border-2 border-indigo-500/50" 
              style={scannerStyle}
            />
          </div>
        </div>
        
        <div className="bg-[#161B22] rounded-xl p-8 shadow-2xl border border-gray-800 backdrop-blur-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
            Welcome to Your Personal Financial Vault
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Secure access to your financial dashboard
          </p>
          
          <div className="space-y-6">
            <div className="relative">
              <button 
                type="button" 
                className={`relative w-full flex items-center justify-center gap-3 bg-indigo-800 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-all duration-300 overflow-hidden ${isHovered ? 'shadow-[0_0_15px_rgba(99,102,241,0.6)]' : ''}`} 
                onMouseEnter={() => setIsHovered(true)} 
                onMouseLeave={() => setIsHovered(false)} 
                onClick={handleGoogleLogin} 
                disabled={loading}
              >
                {/* Scanner effect */}
                <div 
                  className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
                  style={scanEffectStyle}
                />
                <div className="z-10 flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
                  <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
                </div>
              </button>
              {/* Biometric scanner ring */}
              <div 
                className={`absolute inset-0 rounded-lg border-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-40'}`} 
                style={ringStyle}
              />
            </div>
            
            <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
              <ShieldIcon size={14} />
              <span>
                Your data is encrypted and secured with bank-grade protocols
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2023 Financial Vault. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* CSS for scanner animation */}
      <style>{`
        @keyframes scanEffect {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;