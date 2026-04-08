import { Driver } from "@/types/auth.types";
import { ProfileFormValues } from "@/screens/profile/types";

export const PHONE_MASK = "+380";
const PHONE_GROUPS = [2, 3, 2, 2]; // 2+3+2+2 = 9 digits (e.g., 50 123 45 67)
export const ACCENT_COLOR = "#F75555";

export function stripPhoneToNineDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  let trimmed = digits;
  if (trimmed.startsWith("380")) {
    trimmed = trimmed.slice(3);
  }
  if (trimmed.startsWith("0")) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.length > 9) {
    trimmed = trimmed.slice(-9);
  }
  return trimmed.slice(0, 9);
}

export function formatPhoneDisplay(digits: string) {
  if (!digits) return "";
  const displayDigits = digits.slice(0, 9);
  const parts: string[] = [];
  let index = 0;
  for (const group of PHONE_GROUPS) {
    if (index >= displayDigits.length) break;
    parts.push(displayDigits.slice(index, index + group));
    index += group;
  }
  return parts.join(" ");
}

export function maskDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function unmaskDateInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return undefined;
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4);
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(value?: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

export function mapDriverToFormValues(
  driver: Driver | null | undefined,
): ProfileFormValues {
  const rawPhone = driver?.user.phone_number ?? "";
  const digits = stripPhoneToNineDigits(rawPhone);
  return {
    firstName: driver?.user.first_name ?? "",
    lastName: driver?.user.last_name ?? "",
    phoneNumber: formatPhoneDisplay(digits),
    dateOfBirth: formatDateDisplay(driver?.user.date_of_birth),
    profileImage: driver?.user.profile_image ?? "",
    licenseExpiry: formatDateDisplay(driver?.license_expiry),
    vehiclePlate: driver?.vehicle_plate ?? "",
  };
}

export function buildPhonePayload(value: string) {
  const digits = stripPhoneToNineDigits(value);
  if (digits.length !== 9) return undefined;
  return `${PHONE_MASK}${digits}`;
}

export function getErrorMessage(error: unknown): string {
  if (!error) return "Сталася невідома помилка";
  const err = error as any;
  
  // Handle backend error object {code, message, details, timestamp}
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.detail === 'string') return data.detail;
  }

  if (typeof err.message === 'string') return err.message;
  
  return "Щось пішло не так, спробуйте ще раз";
}
