export interface PBData {
  id: string;
  first_name: string;
  last_name: string;
  phone_numbers: string[];
}

export interface PBPartialData {
  id?: string;
  first_name?: string;
  last_name?: string;
  phone_numbers?: string[];
}
