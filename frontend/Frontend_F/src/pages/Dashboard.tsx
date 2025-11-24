import { useState } from "react";
import { Header } from "@/components/Dashboard/Section/Header";
import { Sidebar } from "@/components/Dashboard/Section/Sidebar";
import { ChatSection } from "@/components/Dashboard/Section/ChatSection";
import { WeatherSection } from "@/components/Dashboard/Section/WeatherSection";
import { SchemesSection } from "@/components/Dashboard/Section/SchemesSection";
import { TipsSection } from "@/components/Dashboard/Section/TipsSection";
import { MandiSection } from "@/components/Dashboard/Section/MandiSection";


const Dashboard = () => {
  const [language, setLanguage] = useState<"en" | "hi" | "gu">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        language={language}
        setLanguage={setLanguage}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} language={language} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Chat */}
              <div className="lg:col-span-1">
                <ChatSection language={language} />
              </div>

              {/* Center Column - Weather & Schemes */}
              <div className="lg:col-span-1 space-y-6">
                <WeatherSection language={language} />
                <SchemesSection language={language} />
              </div>

              {/* --- FIX 2: Add MandiSection and stack it with TipsSection --- */}
              {/* Right Column - Mandi & Tips */}
              <div className="lg:col-span-1 space-y-6">
                <MandiSection language={language} />
                <TipsSection language={language} />
              </div>
              {/* --- END OF FIX --- */}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
