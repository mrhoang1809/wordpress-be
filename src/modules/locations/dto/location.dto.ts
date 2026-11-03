export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  name: string;
  slug: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  order?: number;
  isActive?: boolean;
}

// Alias for service
export type LocationInput = CreateLocationDto & {
  order: number;
  isActive: boolean;
};

export interface UpdateLocationDto {
  name?: string;
  slug?: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  order?: number;
  isActive?: boolean;
}
