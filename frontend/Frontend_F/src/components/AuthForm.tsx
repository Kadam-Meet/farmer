import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { indianStatesAndCities } from '../utils/cityData';
// import { useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

const AuthForm: React.FC = () => {
  const { userType, setUser } = useApp();
  // const { user } = useUser();
  const { user } = useApp();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    if (user && user.verified) { // Adjusted check since we don't have unsafeMetadata in mock user easily accessible here without type casting or updating mock
      // For mock user, we can assume verified is enough or check userType
      const role = user.userType;
      console.log('User role:', role);

      // Since user is already from AppContext, we might not need to set it again, 
      // but keeping logic similar to original if it was intended to sync Clerk user to App state.
      // In this disabled auth mode, user is already set in AppContext.
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contactNumber: '',
    city: '',
    state: '',
    fullAddress: '',
    password: '',
    confirmPassword: '',
    // Worker-specific fields
    jobExpertise: [] as string[],
    customJobExpertise: '',
    skillLevel: '',
    workCapacity: '',
    accommodationNeeded: '',
    timeAvailability: '',
    availabilityDuration: '',
    requiredSalary: '',
    salaryType: '',
    additionalBenefits: [] as string[],
    customAdditionalBenefits: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleJobExpertiseChange = (value: string) => {
    setFormData(prev => {
      const selected = prev.jobExpertise;
      const updated = selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value];
      return { ...prev, jobExpertise: updated };
    });
  };

  const handleBenefitChange = (value: string) => {
    setFormData(prev => {
      const selected = prev.additionalBenefits;
      const updated = selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value];
      return { ...prev, additionalBenefits: updated };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewUrl('');
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const base64Image = profileImage ? await convertToBase64(profileImage) : '';

    try {
      const payload: any = {
        id: user?.id,
        email: user?.email,
        profile_picture: base64Image,
        name: formData.name,
        contact_number: formData.contactNumber,
        state: formData.state,
        city: formData.city,
        full_address: formData.fullAddress,
      };

      if (userType === "worker") {
        payload.job_expertise = formData.jobExpertise?.length
          ? formData.jobExpertise
          : [formData.customJobExpertise || ""];

        payload.skill_level = formData.skillLevel || null;
        payload.work_capacity = formData.workCapacity || null;
        payload.need_accommodation = formData.accommodationNeeded === "yes";
        payload.expected_salary = formData.requiredSalary
          ? parseFloat(formData.requiredSalary)
          : null;
        payload.salary_type = formData.salaryType || null;
        payload.availability_duration = formData.availabilityDuration || null;
        payload.additional_benefits = formData.additionalBenefits?.length
          ? formData.additionalBenefits
          : [formData.customAdditionalBenefits || ""];
      }

      console.log("Final Payload to Send:", payload);

      const endpoint =
        userType === "farmer"
          ? "http://127.0.0.1:8001/farmer/register"
          : "http://127.0.0.1:8001/worker/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        alert(data.detail || "Registration failed.");
        return;
      }

      console.log("Registration Success:", data);


      const registeredUser = {
        ...data.user,

      }
      setUser(registeredUser);

      alert(`${userType} registration successful!`);
      // Mock update metadata since Clerk is disabled
      /*
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...(user.unsafeMetadata || {}),
            role: userType,
            registrationComplete: true,
          },
        });
      }
      */
      navigate(userType === "farmer" ? "/farmer-dashboard" : "/worker-dashboard");

    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Error submitting registration. Please try again.");
    }
  };

  const jobExpertiseOptions = [
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'planting', label: 'Planting' },
    { value: 'general', label: 'General Farm Work' },
    { value: 'machinery', label: 'Machinery Operation' },
    { value: 'driver', label: 'Driver' },
    { value: 'mechanic', label: 'Mechanic' }
  ];

  const additionalBenefitsOptions = [
    { value: 'housing', label: 'Housing' },
    { value: 'food', label: 'Food' },
    { value: 'insurance', label: 'Health Insurance' },
    { value: 'transport', label: 'Transportation' }
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side - Image & Welcome */}
        <div className="hidden md:flex md:w-5/12 bg-green-800 text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Farm pattern"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-800 font-bold text-xl">
                KJ
              </div>
              <span className="text-2xl font-bold tracking-tight">KisanJob</span>
            </div>

            <h2 className="text-3xl font-bold mb-4">
              {userType === 'farmer' ? 'Find the Best Workers' : 'Find the Best Farm Jobs'}
            </h2>
            <p className="text-green-100 leading-relaxed">
              {userType === 'farmer'
                ? 'Connect with skilled agricultural workers, manage your farm efficiently, and grow your business with KisanJob.'
                : 'Discover opportunities, connect with farm owners, and build a sustainable career in agriculture.'}
            </p>
          </div>

          <div className="relative z-10 text-sm text-green-200">
            © 2024 KisanJob Platform
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              Registering as {userType === 'farmer' ? 'Farmer' : 'Worker'}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-md">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="Enter your email"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedState(e.target.value);
                      setFormData(prev => ({ ...prev, city: '' }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select State</option>
                    {Object.keys(indianStatesAndCities).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {selectedState && indianStatesAndCities[selectedState as keyof typeof indianStatesAndCities].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              {/* Worker Specific Fields */}
              {userType === 'worker' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Work Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Expertise</label>
                    <div className="grid grid-cols-2 gap-2">
                      {jobExpertiseOptions.map(option => (
                        <label key={option.value} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.jobExpertise.includes(option.value)}
                            onChange={() => handleJobExpertiseChange(option.value)}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                    <select
                      name="skillLevel"
                      value={formData.skillLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary (₹)</label>
                      <input
                        type="number"
                        name="requiredSalary"
                        value={formData.requiredSalary}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="e.g. 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
                      <select
                        name="salaryType"
                        value={formData.salaryType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="day">Day</option>
                        <option value="month">Month</option>
                        <option value="task">Task</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Needed?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="accommodationNeeded"
                          value="yes"
                          checked={formData.accommodationNeeded === 'yes'}
                          onChange={handleChange}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="accommodationNeeded"
                          value="no"
                          checked={formData.accommodationNeeded === 'no'}
                          onChange={handleChange}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
