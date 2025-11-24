import React, { useState, useEffect } from 'react';
import { User, MapPin, Star, Search, Filter, Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import axios from 'axios';
import JobSelectionModal from './JobSelectionModal';
import { getTranslation } from '../../../utils/translations';
import { MOCK_WORKERS } from '../../../data/mockData';

interface Worker {
  id: string;
  name: string;
  profilePicture: string;
  city: string;
  state: string;
  jobExpertise: string[];
  skillLevel: string;
  workCapacity: string;
  timeAvailability: string;
  requiredSalary: string;
  rating: number;
  completedJobs: number;
  verified: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
}

const FindWorkersSection: React.FC = () => {
  const { language, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [requestSent, setRequestSent] = useState<string[]>([]);
  const [fetchedWorkers, setFetchedWorkers] = useState<Worker[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [farmerJobs, setFarmerJobs] = useState<Job[]>([]);

  // Fetch workers on mount
  useEffect(() => {
    // Use mock data instead of API call
    setFetchedWorkers(MOCK_WORKERS);
  }, []);

  // Fetch farmer's jobs
  const fetchFarmerJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:8001/farmer/jobs/${user?.id}`);
      const jobsData = response.data.jobs || [];

      // Only map required fields
      const formattedJobs = jobsData.map((job: any) => ({
        id: job.job_id,
        title: job.job_title,
        description: job.job_description,
      }));

      setFarmerJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching farmer's jobs:", error);
    }
  };

  console.log(farmerJobs);

  const jobExpertiseOptions = [
    { value: 'harvesting', label: { en: 'Harvesting', hi: 'कटाई', gu: 'લણણી' } },
    { value: 'planting', label: { en: 'Planting', hi: 'बुआई', gu: 'વાવેતર' } },
    { value: 'general', label: { en: 'General Farm Work', hi: 'सामान्य खेती का काम', gu: 'સામાન્ય ખેતીનું કામ' } },
    { value: 'water', label: { en: 'Water Management', hi: 'जल प्रबंधन', gu: 'પાણી વ્યવસ્થાપન' } },
    { value: 'machinery', label: { en: 'Machinery Operation', hi: 'मशीन संचालन', gu: 'મશીન સંચાલન' } },
    { value: 'driver', label: { en: 'Driver', hi: 'ड्राइवर', gu: 'ડ્રાઇવર' } },
    { value: 'mechanic', label: { en: 'Mechanic', hi: 'मैकेनिक', gu: 'મિકેનિક' } }
  ];

  // Filter logic
  const filteredWorkers = fetchedWorkers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise =
      !selectedExpertise || worker.jobExpertise.includes(selectedExpertise);
    const matchesLocation =
      !selectedLocation || worker.city.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesSkill = !selectedSkillLevel || worker.skillLevel === selectedSkillLevel;
    return matchesSearch && matchesExpertise && matchesLocation && matchesSkill;
  });

  // Open modal and fetch jobs
  const handleSendRequest = async (workerId: string) => {
    setSelectedWorkerId(workerId);
    await fetchFarmerJobs();
    setIsModalOpen(true);
  };

  // Send request with selected job
  const handleConfirmSendRequest = async (jobId: string) => {
    if (!selectedWorkerId) return;

    try {
      const payload = {
        farmer_id: user?.id,
        worker_id: selectedWorkerId,
        job_id: jobId,
      };

      console.log("Sending request payload:", payload);

      const res = await axios.post("http://localhost:8001/farmer/send_request", payload);

      if (res.status === 200 || res.status === 201) {
        setRequestSent((prev) => [...prev, selectedWorkerId]);
        alert("Request sent successfully!");
      } else {
        alert("Failed to send request. Try again later.");
      }
    } catch (err: any) {
      console.error("Error sending request:", err);
      alert(err.response?.data?.detail || "Error sending request.");
    } finally {
      setIsModalOpen(false);
      setSelectedWorkerId(null);
    }
  };

  const getExpertiseLabel = (expertise: string) => {
    const option = jobExpertiseOptions.find((opt) => opt.value === expertise);
    return option ? option.label[language as keyof typeof option.label] : expertise;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <User className="mr-3 text-green-600" size={28} />
          {getTranslation('findWorkers', language)}
        </h2>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'नाम या स्थान खोजें'
                : language === 'gu'
                  ? 'નામ અથવા સ્થાન શોધો'
                  : 'Search by name or location'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Filter size={18} className="mr-2" />
          {language === 'hi' ? 'फ़िल्टर' : language === 'gu' ? 'ફિલ્ટર' : 'Filter'}
        </button>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center mb-4">
              <img
                src={worker.profilePicture}
                alt={worker.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  {worker.name}
                  {worker.verified && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ {language === 'hi' ? 'सत्यापित' : language === 'gu' ? 'ચકાસાયેલ' : 'Verified'}
                    </span>
                  )}
                </h3>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin size={14} className="mr-1" />
                  {worker.city}, {worker.state}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {language === 'hi' ? 'विशेषज्ञता:' : language === 'gu' ? 'નિપુણતા:' : 'Expertise:'}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(worker.jobExpertise ?? []).slice(0, 3).map((expertise) => (
                    <span
                      key={expertise}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {getExpertiseLabel(expertise)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="ml-1 text-sm font-medium">{worker.rating}</span>
                </div>
                <p className="text-lg font-bold text-green-600">{worker.requiredSalary}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              {requestSent.includes(worker.id) ? (
                <div className="text-center py-2">
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
                    {language === 'hi'
                      ? 'अनुरोध भेजा गया'
                      : language === 'gu'
                        ? 'વિનંતી મોકલી'
                        : 'Request Sent'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleSendRequest(worker.id)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Send size={18} className="mr-2" />
                  {language === 'hi'
                    ? 'अनुरोध भेजें'
                    : language === 'gu'
                      ? 'વિનંતી મોકલો'
                      : 'Send Request'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {language === 'hi'
              ? 'कोई मजदूर नहीं मिला'
              : language === 'gu'
                ? 'કોઈ કામદાર મળ્યો નથી'
                : 'No workers found'}
          </h3>
        </div>
      )}

      {/* Job Selection Modal */}
      <JobSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobs={farmerJobs}
        onSelectJob={handleConfirmSendRequest}
      />
    </div>
  );
};

export default FindWorkersSection;