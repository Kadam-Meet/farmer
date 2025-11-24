import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import HomeSection from './Section/HomeSection';
import FindWorkSection from './Section/FindWorkSection';
import ApplicationsSection from './Section/ApplicationsSection';
import NewsSection from './Section/NewsSection';
import NotificationsSection from './Section/NotificationsSection';
import ProfileSection from './Section/ProfileSection';
import { useApp } from '../../context/AppContext';

import { useSearchParams } from 'react-router-dom';

const WorkerDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSection = searchParams.get('tab') || 'home';
  const [activeSection, setActiveSection] = useState(initialSection);


  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'find-work':
        return <FindWorkSection />;
      case 'applications':
        return <ApplicationsSection />;
      case 'news':
        return <NewsSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <HomeSection />;
    }
  };

  const { user } = useApp();

  return (
    <div className="flex">
      <Sidebar setActiveSection={setActiveSection} activeSection={activeSection} userType={user?.userType || 'worker'} />
      <main className="flex-grow p-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default WorkerDashboard;
