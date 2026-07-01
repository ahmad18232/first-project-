export function isValidEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(lowerEmail);
}

/**
 * Validates whether string is "DD-MM-YYYY hh:mm AM/PM" or "DD-MM-YYYY hh:mm PM" and is in the future.
 * e.g., "02-07-2026 07:00 PM"
 */
export function isFutureDateTime(dateTimeStr: string, referenceTime: Date = new Date("2026-07-01T08:33:33-07:00")): { isValid: boolean; errorMsg?: string } {
  const regex = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s*(AM|PM|am|pm)$/;
  const match = dateTimeStr.trim().match(regex);

  if (!match) {
    return {
      isValid: false,
      errorMsg: "Invalid format. Use e.g., 02-07-2026 07:00 PM."
    };
  }

  const [, dayStr, monthStr, yearStr, hourStr, minStr, ampm] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed month
  const year = parseInt(yearStr, 10);
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (month < 0 || month > 11 || day < 1 || day > 31 || hour < 1 || hour > 12 || min < 0 || min > 59) {
    return {
      isValid: false,
      errorMsg: "Invalid date or time values."
    };
  }

  // Adjust hour for AM/PM
  const isPM = ampm.toUpperCase() === 'PM';
  if (isPM && hour < 12) {
    hour += 12;
  } else if (!isPM && hour === 12) {
    hour = 0;
  }

  const showTime = new Date(year, month, day, hour, min);
  
  if (isNaN(showTime.getTime())) {
    return {
      isValid: false,
      errorMsg: "Invalid calendar date values."
    };
  }

  if (showTime.getTime() <= referenceTime.getTime()) {
    return {
      isValid: false,
      errorMsg: "Show time must be in the future."
    };
  }

  return { isValid: true };
}

export function isValid11DigitNumber(numStr: string): boolean {
  const trimmed = numStr.trim();
  if (trimmed.length !== 11) return false;
  return /^\d{11}$/.test(trimmed);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

/**
 * Helper to convert Date to C++ format "DD-MM-YYYY hh:mm AM/PM"
 */
export function formatToCppDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
}
