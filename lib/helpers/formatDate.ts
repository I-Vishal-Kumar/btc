import { DateTime } from "luxon";

/**
 * Formats a given date using Luxon
 * @param date - The date to format (string, Date, or DateTime)
 * @param format - The desired format (e.g., "yyyy-MM-dd HH:mm:ss")
 * @param timeZone - Optional timezone (default: "UTC")
 * @returns Formatted date string
 */

export const formatDate = (date: string | Date , format: string, timeZone: string = "Asia/Kolkata"): string => {
  // Convert input to Luxon DateTime
  const dateTime = DateTime.fromJSDate(new Date(date)).setZone(timeZone);
  
  // Format and return the string
  return dateTime.toFormat(format);
};
