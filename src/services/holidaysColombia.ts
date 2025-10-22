import axios from "axios";
import { ENV } from "../config/env";
import { DateTime } from "luxon";

export class HolidaysColombiaService {
  private apiUrl: string;
  private holidaysCache: string[] | null = null;
  private lastFetchTime: number | null = null;

  constructor() {
    this.apiUrl = ENV.HOLIDAYS_URL;
  }

  async getHolidays(): Promise<string[]> {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Usar caché si los datos fueron obtenidos en el último día
    if (
      this.holidaysCache &&
      this.lastFetchTime &&
      Date.now() - this.lastFetchTime < ONE_DAY_MS
    ) {
      return this.holidaysCache;
    }

    try {
      const response = await axios.get(`${this.apiUrl}`);
      //   console.log("Holidays API response data:", response.data);
      const data = response.data;
      const holidays: string[] = data.map((holiday: string) =>
        DateTime.fromISO(holiday, { zone: "America/Bogota" }).toISODate()
      );
      this.holidaysCache = holidays;
      this.lastFetchTime = Date.now();
      return holidays;
    } catch (error) {
      console.error("Error fetching holidays:", error);
      return [];
    }
  }
}
