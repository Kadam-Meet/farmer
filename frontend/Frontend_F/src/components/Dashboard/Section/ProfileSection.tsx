import React, { useState, useEffect } from 'react';
import { Camera, Save, Phone, MapPin, Award, Loader } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MOCK_PROFILE } from '../../../data/mockData';

const ProfileSection: React.FC = () => {
  const { user, language } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    name: '',
    contactNumber: '',
    email: '',
    city: '',
    state: '',
    fullAddress: '',
    // Worker specific fields
    jobExpertise: '',
    customJobExpertise: '',
    skillLevel: '',
    workCapacity: '',
    expectedSalary: '',
    salaryType: '',
    accomodationNeeded: false,
    additionalBenefitsRequired: '',
    customAdditionalBenefits: '',
    availabilityDuration: '',
  });

  // Fetch profile data on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Use mock data instead of API call
      const mockData: any = user?.userType === 'farmer' ? MOCK_PROFILE.farmer : MOCK_PROFILE.worker;
      const data: any = mockData;

      const newProfileData: any = {
        name: data.name || "",
        contactNumber: data.contactNumber || "",
        email: data.email || "",
        city: data.city || "",
        state: data.state || "",
        fullAddress: data.fullAddress || "",

        // WORKER FIELDS
        jobExpertise: data.jobExpertise || "",
        customJobExpertise: data.customJobExpertise || "",
        skillLevel: data.skillLevel || "",
        workCapacity: data.workCapacity || "",
        expectedSalary: data.expectedSalary || "",
        salaryType: data.salaryType || "",
        accomodationNeeded: data.accomodationNeeded ?? false,
        additionalBenefitsRequired: data.additionalBenefitsRequired || "",
        customAdditionalBenefits: data.customAdditionalBenefits || "",
        availabilityDuration: data.availabilityDuration || "",
      };

      setProfileData(newProfileData);

      if (data.profilePicture) {
        setPreviewUrl(data.profilePicture);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Error fetching profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      setIsEditing(false);
      setLoading(true);

      const endpoint =
        user?.userType === "farmer"
          ? `http://127.0.0.1:8001/farmer/update_profile/${user?.id}`
          : `http://127.0.0.1:8001/worker/update_profile/${user?.id}`;

      // Prepare payload
      const payload: any = {
        name: profileData.name,
        contact_number: profileData.contactNumber,
        city: profileData.city,
        state: profileData.state,
        full_address: profileData.fullAddress,
        job_expertise:
          profileData.jobExpertise
            ?.split(",")
            .map((v: string) => v.trim()) || [],

        skill_level: profileData.skillLevel,

        work_capacity: profileData.workCapacity,
        expected_salary: parseFloat(profileData.expectedSalary || '0'),
        salary_type: profileData.salaryType,
        need_accommodation: profileData.accomodationNeeded,
        additional_benefits:
          profileData.additionalBenefitsRequired
            ?.split(",")
            .map((v: string) => v.trim()) || [],

        availability_duration: profileData.availabilityDuration,
      };

      // Convert image to base64 if selected
      if (profileImage) {
        const base64string = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(profileImage);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        payload.profile_picture = base64string;
      }

      // Remove fields that should not be sent
      delete payload.email;
      delete payload.id;

      console.log("Payload:", payload);

      // Send update request
      const response = await axios.put(endpoint, payload);

      toast.success("Profile updated successfully! 🎉");

      const updated = response.data.updated_profile;

      // Update state with returned values
      setProfileData((prev: any) => ({
        ...prev,
        name: updated.name || prev.name,
        contactNumber: updated.contact_number || prev.contactNumber,
        city: updated.city || prev.city,
        state: updated.state || prev.state,
        fullAddress: updated.full_address || prev.fullAddress,

        jobExpertise: updated.job_expertise?.join(", ") || prev.jobExpertise,
        customJobExpertise:
          updated.custom_job_expertise || prev.customJobExpertise,

        skillLevel: updated.skill_level || prev.skillLevel,
        workCapacity: updated.work_capacity || prev.workCapacity,
        expectedSalary: updated.expected_salary || prev.expectedSalary,
        salaryType: updated.salary_type || prev.salaryType,

        accomodationNeeded:
          updated.need_accommodation !== undefined
            ? updated.need_accommodation
            : prev.accomodationNeeded,

        additionalBenefitsRequired:
          updated.additional_benefits?.join(", ") ||
          prev.additionalBenefitsRequired,

        customAdditionalBenefits:
          updated.custom_additional_benefits || prev.customAdditionalBenefits,

        availabilityDuration:
          updated.availability_duration || prev.availabilityDuration,
      }));

      // FIXED: Correct backend key → profile_picture
      if (updated.profile_picture) {
        setPreviewUrl(updated.profile_picture);
      }

      setProfileImage(null);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData((prev: any) => ({
      ...prev,
      [field]: value
    }));
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

  return (

    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <Loader className="animate-spin" size={24} />
            <span className="text-gray-800 font-medium">
              {language === 'hi' ? 'लोड हो रहा है...' : language === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading...'}
            </span>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {language === 'hi' ? 'प्रोफाइल' :
              language === 'gu' ? 'પ્રોફાઇલ' :
                'Profile'}
          </h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : user?.userType === 'farmer'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
          >
            {isEditing ? (
              <>
                <Save size={16} className="inline mr-2" />
                {language === 'hi' ? 'सहेजें' : language === 'gu' ? 'સાચવો' : 'Save'}
              </>
            ) : (
              language === 'hi' ? 'संपादित करें' : language === 'gu' ? 'સંપાદિત કરો' : 'Edit'
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Picture */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white ${user?.userType === 'farmer' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors cursor-pointer block"
                    >
                      <Camera size={16} />
                    </label>
                  </div>
                )}
              </div>
              {isEditing && previewUrl && (
                <button
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700 text-sm font-medium mb-2"
                >
                  {language === 'hi' ? 'तस्वीर हटाएं' : language === 'gu' ? 'ચિત્ર હટાવો' : 'Remove Image'}
                </button>
              )}
              <h3 className="text-xl font-semibold text-gray-800">{profileData.name}</h3>
              <p className="text-gray-500 capitalize">{user?.userType}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'hi' ? 'पूरा नाम' : language === 'gu' ? 'સંપૂર્ણ નામ' : 'Full Name'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="py-2 text-gray-800">{profileData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  {language === 'hi' ? 'संपर्क नंबर' : language === 'gu' ? 'સંપર્ક નંબર' : 'Contact Number'}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="+91 98765 43210"
                  />
                ) : (
                  <p className="py-2 text-gray-800">{profileData.contactNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'hi' ? 'ईमेल' : language === 'gu' ? 'ઈમેઈલ' : 'Email'}
                </label>
                <p className="py-2 text-gray-800">{profileData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  {language === 'hi' ? 'शहर' : language === 'gu' ? 'શહેર' : 'City'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="py-2 text-gray-800">{profileData.city || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'hi' ? 'राज्य' : language === 'gu' ? 'રાજ્ય' : 'State'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="py-2 text-gray-800">{profileData.state || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Full Address - Only for Farmers */}
            {user?.userType === 'farmer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'hi' ? 'पूरा पता' : language === 'gu' ? 'સંપૂર્ણ સરનામું' : 'Full Address'}
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="py-2 text-gray-800">{profileData.fullAddress || 'Not provided'}</p>
                )}
              </div>
            )}

            {/* Worker Specific Fields */}
            {user?.userType === 'worker' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award size={16} className="inline mr-1" />
                    {language === 'hi' ? 'विशेषज्ञता' : language === 'gu' ? 'નિપુણતા' : 'Job Expertise'}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.jobExpertise || ''}
                      onChange={(e) => handleInputChange('jobExpertise', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Harvesting, Planting, etc."
                    />
                  ) : (
                    <p className="py-2 text-gray-800">{profileData.jobExpertise || 'Not specified'}</p>
                  )}
                </div>

                {profileData.customJobExpertise && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hi' ? 'अन्य विशेषज्ञता' : language === 'gu' ? 'અન્ય નિપુણતા' : 'Other Expertise'}
                    </label>
                    <p className="py-2 text-gray-800">{profileData.customJobExpertise}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hi' ? 'कौशल स्तर' : language === 'gu' ? 'કૌશલ્ય સ્તર' : 'Skill Level'}
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.skillLevel || ''}
                        onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="experienced">Experienced</option>
                        <option value="expert">Expert</option>
                      </select>
                    ) : (
                      <p className="py-2 text-gray-800 capitalize">{profileData.skillLevel || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hi' ? 'कार्य क्षमता' : language === 'gu' ? 'કાર્ય ક્ષમતા' : 'Work Capacity'}
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.workCapacity || ''}
                        onChange={(e) => handleInputChange('workCapacity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Capacity</option>
                        <option value="light">Light Work</option>
                        <option value="moderate">Moderate Work</option>
                        <option value="heavy">Heavy Work</option>
                      </select>
                    ) : (
                      <p className="py-2 text-gray-800 capitalize">{profileData.workCapacity || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hi' ? 'समय उपलब्धता' : language === 'gu' ? 'સમય ઉપલબ્ધતા' : 'Availability Duration'}
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.availabilityDuration || ''}
                        onChange={(e) => handleInputChange('availabilityDuration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Availability</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    ) : (
                      <p className="py-2 text-gray-800 capitalize">{profileData.availabilityDuration || 'Not specified'}</p>
                    )}
                  </div>


                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hi' ? 'आवश्यक वेतन' : language === 'gu' ? 'જરૂરી પગાર' : 'Expected Salary'}
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.expectedSalary || ''}
                        onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Harvesting, Planting, etc."
                      />
                    ) : (

                      <p className="py-2 text-gray-800">
                        ₹{profileData.expectedSalary} {profileData.salaryType ? `/${profileData.salaryType.replace('per-', '')}` : ''}
                      </p>
                    )}

                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hi' ? 'आवास की आवश्यकता' : language === 'gu' ? 'આવાસની જરૂર' : 'Accommodation Needed'}
                    </label>
                    <p className="py-2 text-gray-800">
                      {profileData.accomodationNeeded ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'hi' ? 'अतिरिक्त लाभ' : language === 'gu' ? 'વધારાના ફાયદા' : 'Additional Benefits'}
                  </label>
                  <p className="py-2 text-gray-800">
                    {profileData.additionalBenefitsRequired || 'None specified'}
                    {profileData.customAdditionalBenefits && `, ${profileData.customAdditionalBenefits}`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;