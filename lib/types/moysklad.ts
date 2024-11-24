export interface CounterpartyData {
  name: string;
  phone: string;
  companyType: "individual" | "legal";
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female";
  birthDate: string;
}

export interface MoySkladResponse {
  success: boolean;
  data?: any;
  error?: string;
}