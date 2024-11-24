export const MOYSKLAD_CONFIG = {
  BASE_URL: "https://api.moysklad.ru/api/remap/1.2",
  API_KEY: "1609e33e5cb81e16278df522b37aa6abcb6c7c80"
} as const;

export const TRACKING_REGEX = /^TE-\d{4}$/;

export const COMPANY_INFO = {
  NAME: "TULPAR EXPRESS",
  DESCRIPTION: "Сервис отслеживания посылок TULPAR EXPRESS",
  WORKING_HOURS: "12:00-21:30"
} as const;