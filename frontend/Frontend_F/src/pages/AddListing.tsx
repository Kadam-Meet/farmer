import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ListingType } from "@/types/listing";
import { apiClient, type ListingPeriod } from "@/lib/api";

type ListingFormState = {
  title: string;
  description: string;
  price: string;
  period: ListingPeriod;
  category: string;
  brand: string;
  condition: "excellent" | "good" | "fair";
  area: string;
  pincode: string;
  city: string;
  state: string;
  location: string; // renamed from address → backend expects "location"
};

const initialFormState: ListingFormState = {
  title: "",
  description: "",
  price: "",
  period: "day",
  category: "tractors",
  brand: "mahindra",
  condition: "good",
  area: "",
  pincode: "",
  city: "",
  state: "",
  location: "",
};

const appendIfPresent = (formData: FormData, key: string, value?: string | number | boolean) => {
  if (value === undefined || value === null) return;
  if (typeof value === "number" && Number.isNaN(value)) return;
  const normalized = typeof value === "string" ? value.trim() : String(value);
  if (!normalized) return;
  formData.append(key, normalized);
};

const AddListing = () => {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<ListingType>("equipment");
  const [formValues, setFormValues] = useState<ListingFormState>(initialFormState);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleListingTypeChange = (value: ListingType) => {
    setListingType(value);
    setFormValues((prev) => ({
      ...prev,
      category: value === "equipment"
        ? (prev.category === "land" || !prev.category ? "tractors" : prev.category)
        : "land",
      brand: value === "equipment" ? (prev.brand || "mahindra") : "",
      condition: value === "equipment" ? (prev.condition || "good") : prev.condition,
      area: value === "equipment" ? "" : prev.area,
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setImages(files);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!images.length) {
      toast.error("Please upload at least one image.");
      return;
    }

    const parsedPrice = parseFloat(formValues.price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Enter a valid price greater than zero.");
      return;
    }

    const payload = new FormData();
    payload.append("type", listingType);
    payload.append("title", formValues.title);
    payload.append("description", formValues.description);
    payload.append("category", formValues.category);
    payload.append("period", formValues.period);

    appendIfPresent(payload, `price_per_${formValues.period}`, parsedPrice);
    appendIfPresent(payload, "location", formValues.location);
    appendIfPresent(payload, "pincode", formValues.pincode);
    appendIfPresent(payload, "city", formValues.city);
    appendIfPresent(payload, "state", formValues.state);

    if (listingType === "equipment") {
      appendIfPresent(payload, "brand", formValues.brand);
      appendIfPresent(payload, "condition", formValues.condition);
    }

    if (listingType === "land") {
      appendIfPresent(payload, "area", parseFloat(formValues.area));
    }

    images.forEach((file) => payload.append("images", file));

    setIsSubmitting(true);
    try {
      await apiClient.createListing(payload);
      toast.success("Listing created successfully!");
      setFormValues(initialFormState);
      setImages([]);
      setListingType("equipment");
      navigate("/browse");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create listing.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Add New Listing</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Share your equipment or land with the farming community
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Fill in the information below</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Listing Type */}
                <div className="space-y-2">
                  <Label>Listing Type</Label>
                  <Select value={listingType} onValueChange={(value) => handleListingTypeChange(value as ListingType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* OTHER FIELDS REMAIN EXACTLY SAME */}
                {/* — Title, Description, Pricing, Fields… unchanged — */}

                {/* Location (renamed from address) */}
                <div className="space-y-2">
                  <Label htmlFor="location">Complete Address</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter complete address"
                    required
                    value={formValues.location}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Listing"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/browse")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AddListing;
