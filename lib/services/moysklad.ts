import { MOYSKLAD_CONFIG } from "@/lib/config/moysklad";

class MoySkladService {
  private static instance: MoySkladService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): MoySkladService {
    if (!MoySkladService.instance) {
      MoySkladService.instance = new MoySkladService();
    }
    return MoySkladService.instance;
  }

  private async getToken(): Promise<string> {
    try {
      if (this.token) return this.token;

      const credentials = Buffer.from(
        `${MOYSKLAD_CONFIG.CREDENTIALS.login}:${MOYSKLAD_CONFIG.CREDENTIALS.password}`
      ).toString("base64");

      const response = await fetch(`${MOYSKLAD_CONFIG.BASE_URL}/security/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Accept-Encoding": "gzip",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.error || "Ошибка получения токена");
      }

      const data = await response.json();
      this.token = data.access_token;
      return this.token;
    } catch (error) {
      console.error("Error getting token:", error);
      throw new Error("Ошибка авторизации в МойСклад");
    }
  }

  public async createCounterparty(name: string): Promise<any> {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${MOYSKLAD_CONFIG.BASE_URL}/entity/counterparty`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          companyType: "legal",
          description: "Создано через веб-сайт"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.error || "Ошибка создания организации");
      }

      return await response.json();
    } catch (error) {
      console.error("MoySklad createCounterparty error:", error);
      throw error;
    }
  }
}

export const moySkladService = MoySkladService.getInstance();