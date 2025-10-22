import e, { Request, Response } from "express";
import { DateTime } from "luxon";
import { HolidaysColombiaService } from "../services/holidaysColombia";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CalculateParams,
} from "../types";

import { DAYS, WORKING_HOURS } from "../constants/time";

export const getDiasHabiles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const daysParam = req.query.days as string | undefined;
  const hoursParam = req.query.hours as string | undefined;
  const dateParam = req.query.date as string | undefined;

  let error: ApiErrorResponse = { error: "", message: "" };
  let success: ApiSuccessResponse;

  if (!daysParam && !hoursParam) {
    error = {
      error: "InvalidParameters",
      message: "Debe enviar al menos uno de los parámetros: 'days' o 'hours'.",
    };
    return res.status(400).json(error);
  }

  let days = daysParam ? Number(daysParam) : 0;
  let hours = hoursParam ? Number(hoursParam) : 0;
  let dateOficial: DateTime;

  if (daysParam && !isNumberPositive(days)) {
    error = {
      error: "InvalidParameters",
      message: "El parámetro 'days' debe ser un número entero positivo.",
    };
    return res.status(400).json(error);
  }

  if (hoursParam && !isNumberPositive(hours)) {
    error = {
      error: "InvalidParameters",
      message: "El parámetro 'hours' debe ser un número entero positivo.",
    };
    return res.status(400).json(error);
  }

  if (dateParam) {
    if (
      !dateParam.endsWith("Z") ||
      !DateTime.fromISO(dateParam, { zone: "utc" }).isValid
    ) {
      error = {
        error: "InvalidParameters",
        message:
          "El parámetro 'date' debe estar en formato ISO UTC con Z (por ejemplo: 2025-10-21T08:00:00Z)",
      };
      return res.status(400).json(error);
    } else {
      dateOficial = DateTime.fromISO(dateParam, { zone: "America/Bogota" });
    }
  } else {
    dateOficial = DateTime.now().setZone("America/Bogota");
  }
  // console.log("Fecha inicial:", dateOficial);

  const result = await calculateDate({ days, hours, date: dateOficial });

  if (result) {
    if ("error" in result) {
      // TypeScript ya sabe que es ApiErrorResponse
      return res.status(503).json(result);
    } else {
      success = result;
      return res.status(200).json(success);
    }
  }

  error = {
    error: "CalculationError",
    message: "No se pudo calcular la fecha hábil.",
  };

  return res.status(500).json(error);
};

const calculateDate = async ({
  days,
  hours,
  date,
}: CalculateParams): Promise<ApiSuccessResponse | ApiErrorResponse> => {
  const holidaysService = new HolidaysColombiaService();
  const holidays: string[] = await holidaysService.getHolidays();

  if (holidays.length === 0) {
    return {
      error: "Unavailable",
      message: "No se pudieron obtener los días festivos.",
    };
  }
  date = adjustToWorkTime(date, holidays);

  console.log("Fecha ajustada a horario laboral:", date.toISO());
  for (let i = 0; i < days; i++) {
    date = addOneBusinessDay(date, holidays);
  }

  date = addWorkingHours(date, hours, holidays);
  const utcResult = date.setZone("utc");

  return { date: utcResult.toISO()! };
};

const isNumberPositive = (value: number): boolean => {
  return !isNaN(value) && value > 0 && Number.isInteger(value);
};

const adjustToWorkTime = (date: DateTime, holidays: string[]): DateTime => {
  // Lógica para ajustar la fecha y hora a horario laboral
  // Considerar fines de semana y festivos
  while (isNonWorkingDay(date, holidays)) {
    // Retroceder al anterior día hábil a las 5:00 PM
    console.log(date.toISO(), "no es día hábil, ajustando...");
    date = date
      .minus({ days: 1 })
      .set({ hour: WORKING_HOURS.END, minute: 0, second: 0, millisecond: 0 });
  }
  // console.log("Ajustando fecha inicial:", date.toISO());

  if (date.hour >= WORKING_HOURS.END) {
    return date.set({ hour: WORKING_HOURS.END, minute: 0 });
  } else if (date.hour < WORKING_HOURS.START) {
    return date.minus({ days: 1 }).set({ hour: WORKING_HOURS.END, minute: 0 });
  } else if (
    date.hour >= WORKING_HOURS.LUNCH_START &&
    date.hour < WORKING_HOURS.LUNCH_END
  ) {
    return date.set({ hour: WORKING_HOURS.LUNCH_START, minute: 0 });
  }

  return date;
};

const isNonWorkingDay = (date: DateTime, holidays: string[]): boolean => {
  const isWeekend =
    date.weekday === DAYS.SATURDAY || date.weekday === DAYS.SUNDAY;
  const isHoliday = holidays.includes(date.toISODate()!);
  return isWeekend || isHoliday;
};

const addOneBusinessDay = (date: DateTime, holidays: string[]): DateTime => {
  let next = date.plus({ days: 1 });

  while (isNonWorkingDay(next, holidays)) {
    next = next.plus({ days: 1 });
  }

  return next;
};

const addWorkingHours = (
  date: DateTime,
  hoursToAdd: number,
  holidays: string[]
): DateTime => {
  let current = date;
  let remaining = hoursToAdd;
  // return current;
  while (remaining > 0) {
    // Si pasa del fin de jornada, mover al siguiente día hábil
    if (current.hour >= WORKING_HOURS.END) {
      current = addOneBusinessDay(current, holidays).set({
        hour: WORKING_HOURS.START,
        minute: 0,
      });
      continue;
    }

    // Saltar almuerzo
    if (
      current.hour >= WORKING_HOURS.LUNCH_START &&
      current.hour < WORKING_HOURS.LUNCH_END
    ) {
      current = current.set({ hour: WORKING_HOURS.LUNCH_END, minute: 0 });
      continue;
    }

    // Calcular siguiente hora límite (almuerzo o fin de jornada)
    const nextBreak =
      current.hour < WORKING_HOURS.LUNCH_START
        ? WORKING_HOURS.LUNCH_START
        : current.hour < WORKING_HOURS.END
        ? WORKING_HOURS.END
        : WORKING_HOURS.END;

    const hoursAvailable = nextBreak - (current.hour + current.minute / 60);

    if (remaining <= hoursAvailable) {
      current = current.plus({ hours: remaining });
      remaining = 0;
    } else {
      current = current.plus({ hours: hoursAvailable });
      remaining -= hoursAvailable;
    }
  }

  return current;
};
