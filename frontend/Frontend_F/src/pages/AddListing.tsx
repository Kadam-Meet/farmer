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
  address: string;
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
  address: "",
};

const appendIfPresent = (formData: FormData, key: string, value?: string | number | boolean) => {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value === "number" && Number.isNaN(value)) {
    return;
  }
  const normalized = typeof value === "string" ? value.trim() : String(value);
  if (!normalized) {
    return;
  }
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
      category:
        value === "equipment"
          ? (prev.category === "land" || !prev.category ? "tractors" : prev.category)
          : "land",
      brand: value === "equipment" ? (prev.brand || "mahindra") : "",
      condition: value === "equipment" ? (prev.condition || "good") : prev.condition,
      area: value === "equipment" ? "" : prev.area,
    }));
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    appendIfPresent(payload, "location", formValues.address);
    appendIfPresent(payload, "pincode", formValues.pincode);
    appendIfPresent(payload, "city", formValues.city);
    appendIfPresent(payload, "state", formValues.state);

    if (listingType === "equipment") {
      appendIfPresent(payload, "brand", formValues.brand);
      appendIfPresent(payload, "condition", formValues.condition);
    }

    if (listingType === "land") {
      const parsedArea = parseFloat(formValues.area);
      appendIfPresent(payload, "area", parsedArea);
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Add New Listing</h1>
            <p className="text-muted-foreground text-lg">
              Share your equipment or land with the farming community
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Fill in the information about your equipment or land
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Listing Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Listing Type</Label>
                  <Select value={listingType} onValueChange={(value) => handleListingTypeChange(value as ListingType)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder={listingType === "equipment" ? "e.g., John Deere Tractor" : "e.g., 50 Acres Farmland"}
                    required
                    value={formValues.title}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about the condition, features, and any other relevant information"
                    rows={4}
                    required
                    value={formValues.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Price and Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="250"
                      required
                      min={1}
                      value={formValues.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Per</Label>
                    <Select value={formValues.period} onValueChange={(value) => setFormValues((prev) => ({ ...prev, period: value as ListingPeriod }))}>
                      <SelectTrigger id="period">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category (Equipment only) */}
                {listingType === "equipment" && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formValues.category} onValueChange={(value) => setFormValues((prev) => ({ ...prev, category: value }))}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tractors">Tractors</SelectItem>
                        <SelectItem value="seeding-equipment">Seeding Equipment</SelectItem>
                        <SelectItem value="landscaping-equipment">Landscaping Equipment</SelectItem>
                        <SelectItem value="crop-protection">Crop Protection</SelectItem>
                        <SelectItem value="harvest-equipment">Harvest Equipment</SelectItem>
                        <SelectItem value="haulage">Haulage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {listingType === "land" && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Land Type</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="e.g., Irrigated Farmland"
                      required
                      value={formValues.category}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {/* Area (Land only) */}
                {listingType === "land" && (
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (acres)</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      placeholder="50"
                      required
                      min={0.1}
                      step="0.1"
                      value={formValues.area}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {/* Condition (Equipment only) */}
                {listingType === "equipment" && (
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formValues.condition} onValueChange={(value) => setFormValues((prev) => ({ ...prev, condition: value as ListingFormState["condition"] }))}>
                      <SelectTrigger id="condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Address Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      placeholder="Enter pincode"
                      required
                      value={formValues.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Enter city"
                      required
                      value={formValues.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state"
                    required
                    value={formValues.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter complete address"
                    required
                    value={formValues.address}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Brand (Equipment only) */}
                {listingType === "equipment" && (
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select value={formValues.brand} onValueChange={(value) => setFormValues((prev) => ({ ...prev, brand: value }))}>
                      <SelectTrigger id="brand">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mahindra">Mahindra</SelectItem>
                        <SelectItem value="john-deere">John Deere</SelectItem>
                        <SelectItem value="claas">CLAAS India</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Images</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload clear photos of your {listingType}
                  </p>
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
