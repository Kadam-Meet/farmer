import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { ListingCard } from "@/components/ListingCard";
import { AdvancedFilters, FilterState } from "@/components/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiClient } from "@/lib/api";
import { listingResponseToListing } from "@/lib/listingMapper";
import type { Listing } from "@/types/listing";

const Browse = () => {
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    pricePerDay: [0, 200000],
    pricePerWeek: [0, 1000000],
    pricePerMonth: [0, 3000000],
    distance: 100,
    availableFrom: undefined,
    availableTo: undefined,
  });

  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getListings({ available: true });
      setListings(data.map(listingResponseToListing));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load listings.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const searchText = searchQuery.toLowerCase();
      const matchesSearch =
        listing.title.toLowerCase().includes(searchText) ||
        listing.description.toLowerCase().includes(searchText) ||
        listing.location.toLowerCase().includes(searchText);

      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.some((cat) => listing.category?.toLowerCase() === cat.toLowerCase());

      const matchesBrand =
        filters.brands.length === 0 ||
        (listing.brand && filters.brands.some((brand) => brand.toLowerCase() === listing.brand?.toLowerCase()));

      const matchesPrice =
        listing.price >= filters.pricePerDay[0] &&
        listing.price <= filters.pricePerDay[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });
  }, [filters, listings, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({
      categories: [],
      brands: [],
      pricePerDay: [0, 200000],
      pricePerWeek: [0, 1000000],
      pricePerMonth: [0, 3000000],
      distance: 100,
      availableFrom: undefined,
      availableTo: undefined,
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar userType={user?.userType || 'farmer'} />
      <div className="flex-1 flex overflow-hidden">
        <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Browse Listings</h1>
              <p className="text-muted-foreground text-lg">
                Find the perfect equipment or land for your farming needs
              </p>
            </div>

            <div className="mb-8">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              {isLoading
                ? "Fetching listings..."
                : error
                  ? "Unable to load listings."
                  : `${filteredListings.length} ${filteredListings.length === 1 ? "result" : "results"} found`}
            </div>

            {isLoading && (
              <div className="py-12 text-center text-muted-foreground">
                Loading listings...
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground text-lg">
                  {error}
                </p>
                <Button variant="outline" onClick={fetchListings}>
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {filteredListings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-4">
                      No listings found matching your criteria
                    </p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Browse;
