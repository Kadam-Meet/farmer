import React, { useState, useEffect } from "react";
import axios from "axios";
// import { useUser } from "@clerk/clerk-react";
import { useApp } from "@/context/AppContext";
import { Briefcase, MapPin } from "lucide-react";

const FindWorkSection = () => {
  // const { user } = useUser(); // Clerk user info
  const { user, language } = useApp(); // Use AppContext instead
  const [jobs, setJobs] = useState<any[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8001/worker/find_work");

        // Ensure jobs is always an array
        const jobData =
          Array.isArray(response.data) ? response.data :
            Array.isArray(response.data.jobs) ? response.data.jobs : [];

        setJobs(jobData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Apply for a job
  const handleApply = async (jobId: string) => {

    try {
      const workerId = user?.id; // Clerk user ID

      if (!workerId) {

        alert("Please log in to apply for jobs.");
        return;
      }

      const response = await fetch("http://localhost:8001/worker/apply_for_job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          worker_id: workerId,
          job_id: jobId,
        }),
      });


      if (response.status === 200) {
        setAppliedJobs((prev) => [...prev, jobId]);
        alert("Application sent successfully!");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply for this job.");
    }
  };

  // Filter logic
  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter((job: any) => {
      const locationMatch = filterLocation
        ? job.location?.toLowerCase().includes(filterLocation.toLowerCase())
        : true;
      const categoryMatch = filterCategory
        ? job.category?.toLowerCase().includes(filterCategory.toLowerCase())
        : true;
      return locationMatch && categoryMatch;
    })
    : [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
        Find Work
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="border p-2 rounded-md w-60 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Filter by Category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded-md w-60 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Job Listings */}
      {loading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : filteredJobs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job: any) => (
            <div
              key={job.job_id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {job.job_title}
                </h3>
                <Briefcase className="text-green-600" />
              </div>

              <p className="text-gray-600 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-1 text-gray-500" />
                {job.location}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                <span className="font-medium">Category:</span> {job.category}
              </p>

              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Salary:</span> ₹{job.salary}
              </p>

              {appliedJobs.includes(job.job_id) ? (
                <button
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Application Sent
                </button>
              ) : (
                <button
                  onClick={() => handleApply(job.job_id)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          No jobs found for your filters.
        </p>
      )}
    </div>
  );
};

export default FindWorkSection;
