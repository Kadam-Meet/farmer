import React, { useState } from 'react';

interface Job {
  id: string;
  title: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onSelectJob: (jobId: string) => void;
}

const JobSelectionModal: React.FC<Props> = ({ isOpen, onClose, jobs, onSelectJob }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedJobId) {
      onSelectJob(selectedJobId);
      onClose();
    } else {
      alert('Please select a job.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Select a Job</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center">
              <input
                type="radio"
                id={job.id}
                name="job"
                value={job.id}
                onChange={() => setSelectedJobId(job.id)}
                className="mr-2"
              />
              <label htmlFor={job.id} className="text-lg">{job.title}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSelectionModal;
