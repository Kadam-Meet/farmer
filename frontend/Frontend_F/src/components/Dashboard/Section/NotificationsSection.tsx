import React, { useState } from 'react';
import { Bell, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const NotificationsSection: React.FC = () => {
  const { user, language } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread' | 'job_application' | 'request_accepted'>('all');

  const mockNotifications = [
    {
      id: '1',
      type: 'job_application' as const,
      title: language === 'hi' ? 'नया जॉब आवेदन' : language === 'gu' ? 'નવી જોબ અરજી' : 'New Job Application',
      message: language === 'hi' ? 'रमेश कुमार ने आपकी गेहूं की कटाई की नौकरी के लिए आवेदन किया है।' :
               language === 'gu' ? 'રમેશ કુમારે તમારી ઘઉંની લણણીની નોકરી માટે અરજી કરી છે.' :
               'Ramesh Kumar has applied for your wheat harvesting job.',
      read: false,
      createdAt: new Date('2025-01-15T10:30:00'),
      actionUrl: '/job-applications'
    },
    {
      id: '2',
      type: 'request_accepted' as const,
      title: language === 'hi' ? 'अनुरोध स्वीकार किया गया' : language === 'gu' ? 'વિનંતી સ્વીકારવામાં આવી' : 'Request Accepted',
      message: user?.userType === 'farmer' 
        ? (language === 'hi' ? 'प्रिया पटेल ने आपका काम का अनुरोध स्वीकार किया है।' :
           language === 'gu' ? 'પ્રિયા પટેલે તમારી કામની વિનંતી સ્વીકારી છે.' :
           'Priya Patel has accepted your work request.')
        : (language === 'hi' ? 'राजेश कुमार ने आपका आवेदन स्वीकार किया है।' :
           language === 'gu' ? 'રાજેશ કુમારે તમારી અરજી સ્વીકારી છે.' :
           'Rajesh Kumar has accepted your application.'),
      read: true,
      createdAt: new Date('2025-01-14T15:45:00'),
      actionUrl: '/accepted-requests'
    },
    {
      id: '3',
      type: 'new_job' as const,
      title: language === 'hi' ? 'नई नौकरी उपलब्ध' : language === 'gu' ? 'નવી નોકરી ઉપલબ્ધ' : 'New Job Available',
      message: language === 'hi' ? 'आपके क्षेत्र में सब्जी की खेती का नया काम उपलब्ध है।' :
               language === 'gu' ? 'તમારા વિસ્તારમાં શાકભાજીની ખેતીનું નવું કામ ઉપલબ્ધ છે.' :
               'New vegetable farming work available in your area.',
      read: false,
      createdAt: new Date('2025-01-13T09:15:00'),
      actionUrl: '/find-work'
    }
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_application':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'request_accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'request_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return language === 'hi' ? 'अभी' : language === 'gu' ? 'હમણાં' : 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${language === 'hi' ? 'घंटे पहले' : language === 'gu' ? 'કલાક પહેલાં' : 'hours ago'}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${language === 'hi' ? 'दिन पहले' : language === 'gu' ? 'દિવસ પહેલાં' : 'days ago'}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {language === 'hi' ? 'सूचनाएं' : 
           language === 'gu' ? 'સૂચનાઓ' : 
           'Notifications'}
        </h2>
        <div className="text-sm text-gray-600">
          {filteredNotifications.filter(n => !n.read).length} {language === 'hi' ? 'अपठित' : language === 'gu' ? 'અવાંચિત' : 'unread'}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: { en: 'All', hi: 'सभी', gu: 'બધું' } },
            { key: 'unread', label: { en: 'Unread', hi: 'अपठित', gu: 'અવાંચિત' } },
            { key: 'job_application', label: { en: 'Applications', hi: 'आवेदन', gu: 'અરજીઓ' } },
            { key: 'request_accepted', label: { en: 'Accepted', hi: 'स्वीकृत', gu: 'સ્વીકૃત' } }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              {tab.label[language as keyof typeof tab.label]}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
              notification.read ? 'border-gray-200' : 'border-green-200 bg-green-50/30'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {notification.type === 'request_accepted' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      {language === 'hi' ? 'संपर्क जानकारी अब उपलब्ध है!' : 
                       language === 'gu' ? 'સંપર્ક માહિતી હવે ઉપલબ્ધ છે!' : 
                       'Contact information is now available!'}
                    </p>
                    <button className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {language === 'hi' ? 'संपर्क देखें' : language === 'gu' ? 'સંપર્ક જુઓ' : 'View Contact'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {language === 'hi' ? 'कोई सूचना नहीं मिली' : 
               language === 'gu' ? 'કોઈ સૂચના મળી નથી' : 
               'No notifications found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;