export type DriverStatus = "pending" | "approved" | "rejected" | "suspended";
export type DriverAvailability = "online" | "offline" | "busy";
export type VehicleType = "economy" | "comfort" | "business";
export type DriverDocumentType =
  | "driver_license"
  | "vehicle_registration"
  | "insurance_policy"
  | "vehicle_photo";
export type DriverDocumentStatus = "pending" | "approved" | "rejected";

export interface DriverUserInfo {
  id: string;
  email: string;
  phone_number?: string | null;
  first_name?: string;
  last_name?: string;
  full_name: string;
  profile_image?: string | null;
  date_of_birth?: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export interface DriverDocument {
  id: string;
  doc_type: DriverDocumentType;
  status: DriverDocumentStatus;
  notes: string;
  expires_at: string | null;
  file_url: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
}

export interface Driver {
  id: string;
  user: DriverUserInfo;
  status: DriverStatus;
  availability: DriverAvailability;
  vehicle_type: VehicleType;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_plate: string;
  license_number?: string;
  license_expiry?: string;
  rating: number;
  total_rides: number;
  total_earnings?: number;
  rejection_reason?: string | null;
  suspension_reason?: string | null;
  created_at: string;
  documents?: DriverDocument[];
}

export interface DriverRegistrationData {
  vehicle_type: VehicleType;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_plate: string;
  license_number: string;
  license_expiry: string;
}
