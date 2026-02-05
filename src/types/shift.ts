export interface Location {
  id: string;
  business_type: string;
  location_name: string;
  code: string;
}

export interface DutyCode {
  id: string;
  code: string;
  name: string | null;
  start_time: string;
  end_time: string;
}

export interface Shift {
  id: string;
  staff_id: string;
  location_id: string;
  duty_code_id: string;
  date: string;
  status: string;
  note: string | null;
  location: Location;
  duty_code: DutyCode;
}
