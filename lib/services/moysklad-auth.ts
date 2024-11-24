import { MOYSKLAD_CONFIG } from "@/lib/config/moysklad";

export class MoySkladAuth {
  private static token: string | null = null;

  static async getToken(): Promise<string> {
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
      const error = await response.json();
      throw new Error(error.errors?.[0]?.error || "Failed to get token");
    }

    const data = await response.json();
    this.token = data.access_token;
    return this.token;
  }

  static async getHeaders(): Promise<Headers> {
    const token = await this.getToken();
    return new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    });
  }
}