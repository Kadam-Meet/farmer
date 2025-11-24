import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/types/listing";
import { MapPin, Calendar } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full group">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={listing.image} 
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
            {listing.type === "equipment" ? "Equipment" : "Land"}
          </Badge>
        </div>
        <CardContent className="pt-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{listing.location}</span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>per {listing.period}</span>
          </div>
          <div className="text-xl font-bold text-primary">
            ${listing.price}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
