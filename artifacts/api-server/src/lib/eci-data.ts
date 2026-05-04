// Real 2024 Lok Sabha General Election Results
// Source: Election Commission of India (results.eci.gov.in)

export interface PartyResult {
  party: string;
  shortName: string;
  alliance: "NDA" | "INDIA" | "OTHER";
  seats: number;
  color: string;
}

export const LOK_SABHA_2024_RESULTS: PartyResult[] = [
  { party: "Bharatiya Janata Party", shortName: "BJP", alliance: "NDA", seats: 240, color: "#FF6B35" },
  { party: "Indian National Congress", shortName: "INC", alliance: "INDIA", seats: 99, color: "#138808" },
  { party: "Samajwadi Party", shortName: "SP", alliance: "INDIA", seats: 37, color: "#E31E24" },
  { party: "All India Trinamool Congress", shortName: "TMC", alliance: "INDIA", seats: 29, color: "#2E86AB" },
  { party: "Dravida Munnetra Kazhagam", shortName: "DMK", alliance: "INDIA", seats: 22, color: "#CC0000" },
  { party: "Telugu Desam Party", shortName: "TDP", alliance: "NDA", seats: 16, color: "#FFD700" },
  { party: "Janata Dal (United)", shortName: "JD(U)", alliance: "NDA", seats: 12, color: "#008000" },
  { party: "Shiv Sena (Uddhav Thackeray)", shortName: "SS-UBT", alliance: "INDIA", seats: 9, color: "#FF4500" },
  { party: "NCP (Sharadchandra Pawar)", shortName: "NCP-SP", alliance: "INDIA", seats: 8, color: "#9B59B6" },
  { party: "Shiv Sena (Eknath Shinde)", shortName: "SS", alliance: "NDA", seats: 7, color: "#E74C3C" },
  { party: "Lok Janshakti Party (Ram Vilas)", shortName: "LJP(RV)", alliance: "NDA", seats: 5, color: "#3498DB" },
  { party: "Aam Aadmi Party", shortName: "AAP", alliance: "INDIA", seats: 3, color: "#006CB5" },
  { party: "Rashtriya Janata Dal", shortName: "RJD", alliance: "INDIA", seats: 4, color: "#FFA500" },
  { party: "Communist Party of India (Marxist)", shortName: "CPI(M)", alliance: "INDIA", seats: 4, color: "#CC0000" },
  { party: "Indian Union Muslim League", shortName: "IUML", alliance: "INDIA", seats: 3, color: "#00875A" },
  { party: "YSRCP", shortName: "YSRCP", alliance: "OTHER", seats: 4, color: "#1565C0" },
  { party: "Janasena Party", shortName: "JSP", alliance: "NDA", seats: 2, color: "#FF8C00" },
  { party: "Janata Dal (Secular)", shortName: "JD(S)", alliance: "NDA", seats: 2, color: "#4CAF50" },
  { party: "Communist Party of India", shortName: "CPI", alliance: "INDIA", seats: 2, color: "#B71C1C" },
  { party: "Others / Independents", shortName: "Others", alliance: "OTHER", seats: 28, color: "#95A5A6" },
];

export const ALLIANCE_SUMMARY = [
  { name: "NDA", seats: 293, color: "#FF6B35", description: "National Democratic Alliance" },
  { name: "INDIA", seats: 232, color: "#138808", description: "Indian National Developmental Inclusive Alliance" },
  { name: "Others", seats: 18, color: "#95A5A6", description: "Other parties & Independents" },
];

export const TOTAL_SEATS = 543;
export const MAJORITY_MARK = 272;

// Delhi 2025 Assembly Election Results
export const DELHI_2025_RESULTS: PartyResult[] = [
  { party: "Bharatiya Janata Party", shortName: "BJP", alliance: "NDA", seats: 48, color: "#FF6B35" },
  { party: "Aam Aadmi Party", shortName: "AAP", alliance: "OTHER", seats: 22, color: "#006CB5" },
  { party: "Indian National Congress", shortName: "INC", alliance: "INDIA", seats: 0, color: "#138808" },
];

export const DELHI_TOTAL_SEATS = 70;

export function getECIData(electionTitle: string) {
  if (electionTitle.toLowerCase().includes("lok sabha") || electionTitle.toLowerCase().includes("18th")) {
    return { results: LOK_SABHA_2024_RESULTS, allianceSummary: ALLIANCE_SUMMARY, totalSeats: TOTAL_SEATS, majorityMark: MAJORITY_MARK, type: "general" };
  }
  if (electionTitle.toLowerCase().includes("delhi")) {
    return { results: DELHI_2025_RESULTS, allianceSummary: null, totalSeats: DELHI_TOTAL_SEATS, majorityMark: 36, type: "state" };
  }
  return null;
}
