import React from 'react';
import { Wheat, Users } from 'lucide-react';
// import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LandingPage: React.FC = () => {
  // const { openSignIn, openSignUp } = useClerk();
  const { setUserType } = useApp();
  const navigate = useNavigate();

  const handleUserTypeSelection = async (type: 'farmer' | 'worker', mode: 'login' | 'register') => {
    setUserType(type);

    // Bypass auth for now and go directly to dashboard
    if (type === 'farmer') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/worker-dashboard');
    }

    /*
    if (mode === 'register') {
      // New user — go to Clerk signup and then to /auth
      navigate('/clerk-auth');
      try {
        openSignUp({
          fallbackRedirectUrl: '/auth',
        });
      } catch (e) {
        console.error('Error while signup using clerk', e);
      }
    } else {
      // Existing user login — redirect based on stored Clerk metadata later
      try {
        openSignIn({
          appearance: {
            elements: { rootBox: 'mx-auto mt-12' },
          },
          fallbackRedirectUrl: '/clerk-auth', // Let ClerkAuthWrapper handle routing
        });
      } catch (error) {
        console.error('Error opening login modal:', error);
      }
    }
    */
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url('https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1')`,
      }}
    >
      {/* Main Section */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-8">
              <img
                src="/image.png"
                alt="FarmConnect Logo"
                className="w-24 h-24 object-cover rounded-full drop-shadow-lg border-4 border-white"
              />
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              Welcome to FarmConnect
            </h1>

            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Connecting Farmers and Workers for Better Agriculture
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Farmer Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Wheat className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Farmer</h2>
                <p className="text-gray-600 text-lg">Find workers, lease equipment</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleUserTypeSelection('farmer', 'login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Login as Farmer</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => handleUserTypeSelection('farmer', 'register')}
                  className="w-full bg-white hover:bg-gray-50 text-green-600 py-4 px-6 rounded-xl font-semibold text-lg border-2 border-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Worker Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Worker</h2>
                <p className="text-gray-600 text-lg">Find work, work in agriculture</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleUserTypeSelection('worker', 'login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Login as Worker</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => handleUserTypeSelection('worker', 'register')}
                  className="w-full bg-white hover:bg-gray-50 text-blue-600 py-4 px-6 rounded-xl font-semibold text-lg border-2 border-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
