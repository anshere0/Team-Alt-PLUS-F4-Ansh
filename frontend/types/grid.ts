export interface SmartMeterResponse {
  id: string;
  transformer_id: string;
  meter_number: string;
  consumer_name?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  status: string;
}
