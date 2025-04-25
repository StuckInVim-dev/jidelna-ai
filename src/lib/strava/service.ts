import { PrismaClient } from '@prisma/client';

// USAGE:
// Get today's menu
// const menu = await stravaService.getTodaysMenu();

// Auto-order lunch for a user
// await autoOrderLunch(userId);



const prisma = new PrismaClient();

interface Allergen {
  code: string;
  name: string;
}

interface MenuItem {
  id: string;
  date: string;
  type: string;
  meal_type: string;
  name: string;
  description: string;
  price: string;
  course: string;
  category: string;
  is_soup: boolean;
  allergens: Allergen[];
  allergens_text: string;
  order_restrictions: string;
  serving_location: string;
  diets: string[];
  images: string[];
  order_deadline: string;
  cancellation_deadline: string;
}

interface DailyMenus {
  [date: string]: MenuItem[];
}

export class StravaService {
  private baseUrl = "https://app.strava.cz/api";
  private sessionId: string | null = null;
  private canteenNumber: string;
  private username: string;
  private password: string;

  private headers = {
    "accept": "*/*",
    "accept-language": "cs-CZ,cs;q=0.5",
    "content-type": "text/plain;charset=UTF-8",
    "origin": "https://app.strava.cz",
    "priority": "u=1, i",
    "referer": "https://app.strava.cz/",
    "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
  };

  constructor() {
    this.canteenNumber = process.env.STRAVA_CANTEEN || '';
    this.username = process.env.STRAVA_USERNAME || '';
    this.password = process.env.STRAVA_PASSWORD || '';
  }

  private generateMultiContextCookie(): string {
    const userData = {
      jmeno: this.username,
      cislo: this.canteenNumber
    };
    return "%7B%22lastUser%22%3A%7B%22value%22%3A%22" + 
      JSON.stringify(userData).replace(/"/g, '%5C%22') + 
      "%22%2C%22expiration%22%3A1745624146253%7D%7D";
  }

  private getCookies() {
    return {
      "NEXT_LOCALE": "cs",
      "multiContext": this.generateMultiContextCookie()
    };
  }

  async authenticate(): Promise<boolean> {
    const url = `${this.baseUrl}/login`;
    const data = {
      cislo: this.canteenNumber,
      jmeno: this.username,
      heslo: this.password,
      zustatPrihlasen: false,
      environment: "W",
      lang: "CZ"
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.sessionId = result.sid;
      return true;
    } catch (error) {
      console.error("Authentication failed:", error);
      return false;
    }
  }

  async fetchDailyMenus(): Promise<DailyMenus | null> {
    if (!this.sessionId && !(await this.authenticate())) {
      return null;
    }

    const url = `${this.baseUrl}/objednavky`;
    const data = {
      cislo: this.canteenNumber,
      sid: this.sessionId,
      s5url: "https://wss5.strava.cz/WSStravne5_15/WSStravne5.svc",
      lang: "CZ",
      konto: 0,
      podminka: "",
      ignoreCert: "false"
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      return this.parseMenus(rawData);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      return null;
    }
  }

  private parseMenus(rawData: any): DailyMenus {
    const result: DailyMenus = {};

    for (const [tableKey, items] of Object.entries(rawData)) {
      if (tableKey.startsWith('table') && Array.isArray(items)) {
        const date = items[0]?.datum || null;
        if (date) {
          result[date] = items.map((item: any) => ({
            id: item.id,
            date: item.datum,
            type: item.druh_popis,
            meal_type: item.druh_chod,
            name: item.nazev,
            description: item.delsiPopis,
            price: item.cena,
            course: item.chod,
            category: item.druh,
            is_soup: item.polevka === 'A',
            allergens: item.alergeny
              ?.filter((a: any) => a && a.length >= 2)
              ?.map((a: any) => ({ code: a[0], name: a[1] })) || [],
            allergens_text: item.alergeny_text,
            order_restrictions: item.omezeniObj,
            serving_location: item.vydejniMisto,
            diets: item.diety,
            images: item.obrazky,
            order_deadline: item.casKonec,
            cancellation_deadline: item.casOdhlaseni
          }));
        }
      }
    }

    return result;
  }

  async getTodaysMenu(): Promise<MenuItem[] | null> {
    const menus = await this.fetchDailyMenus();
    if (!menus) return null;

    const today = new Date();
    const todayStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
    return menus[todayStr] || null;
  }

  async getNextDayMenu(): Promise<MenuItem[] | null> {
    const menus = await this.fetchDailyMenus();
    if (!menus) return null;

    const dates = Object.keys(menus)
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('.').map(Number);
        const [dayB, monthB, yearB] = b.split('.').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      });

    const today = new Date();
    const todayStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;

    for (const date of dates) {
      if (date > todayStr) {
        console.log(`Found next available menu for: ${date}`);
        return menus[date];
      }
    }

    return null;
  }
}

export const stravaService = new StravaService();