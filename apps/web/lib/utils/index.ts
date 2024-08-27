import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function capitalizeFirstLetter(str: string): string {
  // Find the first occurrence of an alphabetical character
  const index = str.search(/[a-zA-Z]/);
  if (index === -1) {
    return str; // Return the original string if there are no alphabetical characters
  }
  return (
    str.substring(0, index) + // Everything before the first alphabetical character
    str[index].toUpperCase() + // The first alphabetical character, capitalized
    str.substring(index + 1) // Everything after the first alphabetical character
  );
}
