import type { ListingResponse } from "@/lib/api";
import type { Listing } from "@/types/listing";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const resolvePrimaryPrice = (listing: ListingResponse): number => {
  return (
    listing.price_per_day ??
    listing.price_per_week ??
    listing.price_per_month ??
    listing.price_per_hour ??
    0
  );
};

export const listingResponseToListing = (apiListing: ListingResponse): Listing => ({
  id: apiListing.id,
  title: apiListing.title,
  description: apiListing.description ?? "",
  type: apiListing.type,
  category: apiListing.category,
  price: resolvePrimaryPrice(apiListing),
  period: apiListing.period ?? "day",
  location: apiListing.location,
  image: apiListing.image_url || FALLBACK_IMAGE,
  condition: apiListing.condition ?? undefined,
  brand: apiListing.brand ?? undefined,
  area: apiListing.area ?? undefined,
  city: apiListing.city ?? undefined,
  state: apiListing.state ?? undefined,
  pincode: apiListing.pincode ?? undefined,
  rating: apiListing.rating ?? undefined,
  available: apiListing.available ?? true,
  ownerId: apiListing.owner_id,
  ownerName: apiListing.owner?.full_name ?? "Owner",
  ownerPhone: apiListing.owner?.phone ?? "",
  availableFrom: undefined,
  availableTo: undefined,
  createdAt: new Date(apiListing.created_at),
});

