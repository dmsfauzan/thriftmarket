import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function conditionLabel(c: string) {
  return c === "LIKE_NEW" ? "Like New" : c === "GOOD" ? "Good Condition" : "Fair / Defect";
}
