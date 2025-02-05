import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//convert prisma object into regular JS object
export function convertToRegularJsObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

//format number with decimal places
export function formatNumberWithDecimals(value: number): string {
  const [int, decimal] = value.toString().split("."); // Split the string into an integer and a float

  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}
