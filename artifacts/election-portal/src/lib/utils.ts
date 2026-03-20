import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAadhaar(aadhaar: string) {
  if (!aadhaar) return "";
  return aadhaar.replace(/(\d{4})/g, "$1 ").trim();
}

export function maskAadhaar(aadhaar: string) {
  if (!aadhaar || aadhaar.length < 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.substring(8)}`;
}

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'live':
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'upcoming':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'completed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getElectionTypeLabel(type: string) {
  switch (type?.toLowerCase()) {
    case 'general': return 'General Election';
    case 'state': return 'State Assembly';
    case 'local': return 'Local Body';
    case 'bypolls': return 'By-election';
    default: return type;
  }
}
