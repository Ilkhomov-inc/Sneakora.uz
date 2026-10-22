import type { Gender } from "./types";

// EU shoe sizes. Every product uses one of these grids; the admin sets stock per size.
export const ADULT_SIZES = [
  "35", "35.5", "36", "36.5", "37", "37.5", "38", "38.5", "39", "39.5", "40", "40.5",
  "41", "41.5", "42", "42.5", "43", "43.5", "44", "44.5", "45", "45.5", "46", "47", "48",
];

export const KIDS_SIZES = [
  "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28",
  "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
];

export function sizeGridFor(gender: Gender): string[] {
  return gender === "KIDS" ? KIDS_SIZES : ADULT_SIZES;
}

export function compareSizes(a: string, b: string): number {
  return parseFloat(a) - parseFloat(b);
}
