import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";

const ApplicationsSection: React.FC = () => {
  const { user } = useApp();

  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  // ---------------------------------------------------
  // Fetch Data for Both Sections
  // ---------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    const fetchAll = async () => {
      try {
        // Fetch sent requests
        const sentEndpoint =
          user.userType === "farmer"
            ? `http://localhost:8001/farmer/sent_requests/${user.id}`
            : `http://localhost:8001/worker/sent_requests/${user.id}`;

        const sentRes = await fetch(sentEndpoint);
        const sentData = await sentRes.json();
        console.log("Sent Data:", sentData);
        setSent(sentData.sent_requests || []);

        // Fetch received requests
        const receivedEndpoint =
          user.userType === "farmer"
            ? `http://localhost:8001/farmer/received_requests/${user.id}`
            : `http://localhost:8001/worker/received_requests/${user.id}`;

        const receivedRes = await fetch(receivedEndpoint);
        const receivedData = await receivedRes.json();
        console.log("Received Data:", receivedData);
        setReceived(
          receivedData.applications ||
            receivedData.received_requests ||
            []
        );
      } catch (err) {
        console.error("Error fetching applications", err);
      }
    };

    fetchAll();
  }, [user]);

  // ---------------------------------------------------
  // STATUS helpers
  // ---------------------------------------------------
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // ---------------------------------------------------
  // Accept / Reject Handler
  // ---------------------------------------------------
  const handleStatusChange = async (id: number, newStatus: string) => {
    
    try {
      const statusPayload = {
        collaboration_id: id,
        status: newStatus,
      };
      const endpoint =

        user?.userType === "farmer"
          ? `http://localhost:8001/farmer/update_request_status`
          : `http://localhost:8001/worker/update_request_status`;

      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statusPayload),
      });

      setReceived((prev) =>
        prev.map((req) =>
          req.collaboration_id === id
            ? { ...req, status: newStatus }
            : req
        )
      );
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  // ---------------------------------------------------
  // UI for each card
  // ---------------------------------------------------
  const RenderCard = ({ app }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between mb-3">
        <h3 className="text-lg font-semibold">{app.job_details?.job_title}</h3>

        <div
          className={`px-3 py-1 rounded-full flex items-center gap-1 border ${getStatusColor(
            app.status
          )}`}
        >
          {getStatusIcon(app.status)}
          <span className="capitalize text-sm">{app.status}</span>
        </div>
      </div>

      {/* Opposite party details */}
      <div className="text-sm flex flex-wrap gap-6 text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <User size={14} />
          {user?.userType === "farmer"
            ? app.worker_details?.name
            : app.farmer_details?.name}
        </span>

        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {user?.userType === "farmer"
            ? `${app.worker_details?.city}, ${app.worker_details?.state}`
            : `${app.farmer_details?.city}, ${app.farmer_details?.state}`}
        </span>

        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {formatTime(app.requested_at || app.created_at)}
        </span>
      </div>

      {app.job_details?.job_description && (
        <p className="text-gray-700 mb-2 text-sm">
          {app.job_details.job_description}
        </p>
      )}

      {/* Accept / Reject only in RECEIVED requests */}
      {activeTab === "received" && app.status === "Pending" && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() =>
              handleStatusChange(app.collaboration_id, "Accepted")
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Accept
          </button>

          <button
            onClick={() =>
              handleStatusChange(app.collaboration_id, "Rejected")
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  // ---------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Applications</h2>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "sent"
              ? "bg-green-100 border-green-400"
              : "bg-gray-100"
          }`}
        >
          Sent Requests
        </button>

        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "received"
              ? "bg-green-100 border-green-400"
              : "bg-gray-100"
          }`}
        >
          Received Requests
        </button>
      </div>

      {/* Sent Requests */}
      {activeTab === "sent" && (
        <div className="space-y-4">
          {sent.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Eye className="mx-auto mb-2" />
              No sent requests
            </div>
          ) : (
            sent.map((app) => <RenderCard key={app.collaboration_id} app={app} />)
          )}
        </div>
      )}

      {/* Received Requests */}
      {activeTab === "received" && (
        <div className="space-y-4">
          {received.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Eye className="mx-auto mb-2" />
              No received requests
            </div>
          ) : (
            received.map((app) => (
              <RenderCard key={app.collaboration_id} app={app} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsSection;
