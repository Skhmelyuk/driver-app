export type RideStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type VehicleType = 'economy' | 'comfort' | 'business';

export interface PassengerInfo {
  id: string;
  name: string;
  rating: number;
  phone: string;
}

export interface ActiveRide {
  id: string;
  status: RideStatus;
  vehicle_type: VehicleType;
  pickup_lat: number;
  pickup_lon: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lon: number;
  dropoff_address: string;
  estimated_distance: number;
  estimated_duration: number;
  estimated_price: string;
  final_price: string | null;
  discount: string;
  passenger_info: PassengerInfo;
  accepted_at: string | null;
  started_at: string | null;
}
