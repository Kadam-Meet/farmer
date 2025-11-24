import React from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Bell, X } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useState } from 'react';

const HomeSection: React.FC = () => {
  const { user } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  
  
  const notifications = [
    {
      id: '1',
      title: 'New Job Application',
      message: 'Ramesh Kumar has applied for your wheat harvesting job.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: '2',
      title: 'Request Accepted',
      message: user?.userType === 'farmer' 
        ? 'Priya Patel has accepted your work request.'
        : 'Rajesh Kumar has accepted your application.',
      time: '1 day ago',
      unread: false
    },
    {
      id: '3',
      title: 'New Job Available',
      message: 'New vegetable farming work available in your area.',
      time: '3 days ago',
      unread: true
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const farmerStats = [
    {
      title: 'Active Jobs',
      value: '5',
      icon: Briefcase,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Applications',
      value: '23',
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Monthly Earnings',
      value: '₹45,000',
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%'
    },
    {
      title: 'Equipment Lease',
      value: '₹12,000',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5%'
    }
  ];

  const workerStats = [
    {
      title: 'Jobs Completed',
      value: '18',
      icon: Briefcase,
      color: 'bg-blue-500',
      change: '+22%'
    },
    {
      title: 'Total Earnings',
      value: '₹28,500',
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+18%'
    },
    {
      title: 'Average Rating',
      value: '4.8/5',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '+0.2'
    },
    {
      title: 'This Month Jobs',
      value: '6',
      icon: Users,
      color: 'bg-purple-500',
      change: '+3'
    }
  ];

  const stats = user?.userType === 'farmer' ? farmerStats : workerStats;
   
  const recentActivities = [
    {
      id: 1,
      type: user?.userType === 'farmer' ? 'application' : 'job',
      title: user?.userType === 'farmer' ? 
        'New application for wheat harvesting' :
        'Wheat harvesting job completed',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: user?.userType === 'farmer' ? 'equipment' : 'application',
      title: user?.userType === 'farmer' ? 
        'Tractor leased out successfully' :
        'Applied for vegetable farm work',
      time: '1 day ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received',
      time: '3 days ago',
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-green-600 rounded-xl p-6 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-green-100">
              {user?.userType === 'farmer' ? 
                'You have received 3 new applications today.' :
                'You have 5 new job opportunities today.'
              }
            </p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{activity.title}</p>
                    <p className="text-gray-500 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {user?.userType === 'farmer' ? (
              <>
                <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg font-medium transition-colors text-left">
                  Post New Job
                </button>
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg font-medium transition-colors text-left">
                  Add Equipment
                </button>
                <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 px-4 rounded-lg font-medium transition-colors text-left">
                  View Applications
                </button>
              </>
            ) : (
              <>
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg font-medium transition-colors text-left">
                  Search New Jobs
                </button>
                <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg font-medium transition-colors text-left">
                  Update Profile
                </button>
                <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 px-4 rounded-lg font-medium transition-colors text-left">
                  View My Applications
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;