export const MOYSKLAD_CONFIG = {
  BASE_URL: "https://api.moysklad.ru/api/remap/1.2",
  CREDENTIALS: {
    login: "admin@tulparexpress",
    password: "Tulpar321654987*"
  }
} as const;

export type CompanyType = "legal" | "entrepreneur" | "individual";
export type Gender = "MALE" | "FEMALE";