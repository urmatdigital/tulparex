const MOYSKLAD_LOGIN = "admin@tulparexpress";
const MOYSKLAD_PASSWORD = "Tulpar321654987*";
const BASE_URL = "https://api.moysklad.ru/api/remap/1.2";

let accessToken: string | null = null;

async function getAccessToken() {
  if (accessToken) return accessToken;

  try {
    const credentials = Buffer.from(`${MOYSKLAD_LOGIN}:${MOYSKLAD_PASSWORD}`).toString('base64');
    
    const response = await fetch(`${BASE_URL}/security/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.error || 'Failed to get token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    return accessToken;

  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

interface CounterpartyData {
  name: string;
  phone: string;
  companyType: "individual" | "legal";
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female";
  birthDate: string;
}

async function handleMoySkladResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ errors: [{ error: "Ошибка сервера" }] }));
    throw new Error(errorData?.errors?.[0]?.error ?? "Ошибка сервера МойСклад");
  }
  return response.json();
}

export async function createCounterparty(data: CounterpartyData) {
  try {
    const token = await getAccessToken();
    const cleanPhone = data.phone.replace(/\D/g, "");
    
    const response = await fetch(`${BASE_URL}/entity/counterparty`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        phone: cleanPhone,
        companyType: data.companyType,
        actualAddress: "",
        legalAddress: "",
        description: `Регистрация через сайт\nПол: ${data.gender === "male" ? "Мужской" : "Женский"}\nДата рождения: ${data.birthDate}`,
        attributes: [
          {
            id: "firstName",
            name: "Имя",
            type: "string",
            value: data.firstName
          },
          {
            id: "lastName",
            name: "Фамилия",
            type: "string",
            value: data.lastName
          },
          {
            id: "middleName",
            name: "Отчество",
            type: "string",
            value: data.middleName || ""
          },
          {
            id: "gender",
            name: "Пол",
            type: "string",
            value: data.gender
          },
          {
            id: "birthDate",
            name: "Дата рождения",
            type: "string",
            value: data.birthDate
          }
        ]
      })
    });

    return handleMoySkladResponse(response);
  } catch (error) {
    console.error('Error creating counterparty:', error);
    throw error;
  }
}