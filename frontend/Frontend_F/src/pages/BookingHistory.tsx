import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { apiClient, type BookingResponse } from "@/lib/api";

const BookingHistory = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      setCurrentUserId(user.id);

      const data = await apiClient.getBookings({
        role: 'all',
        limit: 100,
        offset: 0,
      });
      
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: "pending" | "accepted" | "rejected" | "completed" | "cancelled") => {
    try {
      await apiClient.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
      completed: "outline",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const filterBookings = (role: "all" | "owner" | "renter") => {
    if (role === "all") return bookings;
    if (role === "owner") return bookings.filter(b => b.owner_id === currentUserId);
    return bookings.filter(b => b.renter_id === currentUserId);
  };

  const renderBookingRow = (booking: BookingResponse) => {
    const isOwner = booking.owner_id === currentUserId;
    const canAcceptReject = isOwner && booking.status === "pending";

    return (
      <tr key={booking.id} className="border-b">
        <td className="py-4 px-4">{format(new Date(booking.start_date), "dd/MM/yyyy")}</td>
        <td className="py-4 px-4">{booking.listing?.title || "N/A"}</td>
        <td className="py-4 px-4 capitalize">{booking.listing?.type || "N/A"}</td>
        <td className="py-4 px-4">₹{booking.total_price?.toLocaleString() || "0"}</td>
        <td className="py-4 px-4">{getStatusBadge(booking.status)}</td>
        <td className="py-4 px-4">
          <Badge variant="outline">{isOwner ? "Owner" : "Renter"}</Badge>
        </td>
        <td className="py-4 px-4">
          <div className="flex gap-2">
            {canAcceptReject ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate(booking.id, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(booking.id, "accepted")}
                >
                  Accept
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline">
                View Details
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Booking History</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="owner">As Owner</TabsTrigger>
            <TabsTrigger value="renter">As Renter</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Asset Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Price</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Role</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterBookings("all").map(renderBookingRow)}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="owner">
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Asset Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Price</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Role</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterBookings("owner").map(renderBookingRow)}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="renter">
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Asset Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Price</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Role</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterBookings("renter").map(renderBookingRow)}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingHistory;
