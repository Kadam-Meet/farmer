import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatDialog } from "@/components/ChatDialog";
import { MapPin, Calendar, User, ArrowLeft, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/api";
import { listingResponseToListing } from "@/lib/listingMapper";
import type { Listing } from "@/types/listing";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const loadListing = useCallback(async () => {
    if (!id) {
      setError("Listing ID is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getListingById(id);
      setListing(listingResponseToListing(response));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load listing.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleBookNow = async () => {
    if (!listing) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to book this listing");
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    try {
      const { error } = await supabase.from("bookings").insert({
        listing_id: listing.id,
        renter_id: user.id,
        owner_id: listing.ownerId || "00000000-0000-0000-0000-000000000000",
        start_date: today,
        end_date: tomorrow,
        total_price: listing.price,
        status: "pending",
      });

      if (error) throw error;
      toast.success("Booking request sent! Waiting for owner confirmation.");
      navigate("/bookings");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground text-lg">Loading listing...</p>
        </div>
      );
    }

    if (error || !listing) {
      return (
        <div className="container mx-auto px-4 py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold">Listing unavailable</h1>
          <p className="text-muted-foreground">{error ?? "We couldn't find this listing."}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={loadListing} variant="outline">
              Retry
            </Button>
            <Button onClick={() => navigate("/browse")}>
              Back to Browse
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/browse")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <img 
                src={listing.image} 
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="mb-2">
                    {listing.type === "equipment" ? "Equipment" : "Land"}
                  </Badge>
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ₹{listing.price.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">per {listing.period}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{listing.ownerName}</span>
                </div>
                {listing.area && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{listing.area} acres</span>
                  </div>
                )}
                {listing.condition && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="capitalize">{listing.condition} condition</span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Owner</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{listing.ownerName}</p>
                      <p className="text-sm text-muted-foreground">Member since 2023</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Availability</h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">{listing.available ? "Available now" : "Currently unavailable"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Details</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    {listing.category && (
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium text-foreground">{listing.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-foreground capitalize">{listing.type}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => setChatOpen(true)} className="w-full" size="lg" variant="outline">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with Seller
                  </Button>
                  <Button onClick={handleBookNow} className="w-full" size="lg" disabled={!listing.available}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Contact the seller or book directly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          listingId={listing.id}
          receiverId={listing.ownerId || "00000000-0000-0000-0000-000000000000"}
          receiverName={listing.ownerName}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {renderContent()}
    </div>
  );
};

export default ListingDetail;
