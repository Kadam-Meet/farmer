import React from 'react';
import Sidebar from '@/components/Sidebar';
import { WeatherSection } from '@/components/Dashboard/Section/WeatherSection';
import { MandiSection } from '@/components/Dashboard/Section/MandiSection';
import { TipsSection } from '@/components/Dashboard/Section/TipsSection';
import { SchemesSection } from '@/components/Dashboard/Section/SchemesSection';
import { useApp } from '@/context/AppContext';

const AgriTools = () => {
    const { language, user } = useApp();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Persistent Sidebar */}
            <Sidebar userType={user?.userType || 'farmer'} activeSection="agri-tools" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header placeholder if needed, otherwise just main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                    <div className="container mx-auto space-y-8 max-w-7xl">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
                                {language === 'hi' ? 'स्मार्ट खेती उपकरण' :
                                    language === 'gu' ? 'સ્માર્ટ ખેતી સાધનો' :
                                        'Smart Farming Tools'}
                            </h1>
                            <p className="text-gray-600 text-lg">
                                {language === 'hi' ? 'आपकी खेती को बेहतर बनाने के लिए आधुनिक तकनीक' :
                                    language === 'gu' ? 'તમારી ખેતીને સુધારવા માટે આધુનિક તકનીક' :
                                        'Advanced technology to optimize your farming'}
                            </p>
                        </div>

                        {/* Unified Bento Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Row 1: Weather and Mandi - Side by Side */}
                            <div className="lg:col-span-1 h-full">
                                <WeatherSection language={language} />
                            </div>
                            <div className="lg:col-span-1 h-full">
                                <MandiSection language={language} />
                            </div>

                            {/* Row 2: Tips - Full Width */}
                            <div className="lg:col-span-2">
                                <TipsSection language={language} />
                            </div>

                            {/* Row 3: Schemes - Full Width */}
                            <div className="lg:col-span-2">
                                <SchemesSection language={language} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AgriTools;
