export interface Listing {
    id: string;
    title: string;
    description: string;
    type: 'equipment' | 'land';
    category?: string;
    price: number;
    period: 'hour' | 'day' | 'week' | 'month';
    location: string;
    image: string;
    condition?: string;
    brand?: string;
    area?: number;
    city?: string;
    state?: string;
    pincode?: string;
    rating?: number;
    available?: boolean;
    ownerId: string;
    ownerName: string;
    ownerPhone: string;
    availableFrom?: Date;
    availableTo?: Date;
    createdAt: Date;
}

export type ListingType = 'equipment' | 'land';
