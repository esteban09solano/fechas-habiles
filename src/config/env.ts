import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  HOLIDAYS_URL:
    process.env.HOLIDAYS_URL || "https://date.nager.at/api/v3/PublicHolidays",
};
