import { db, electionsTable, candidatesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./logger";

const REAL_ELECTIONS = [
  {
    title: "18th Lok Sabha General Election 2024",
    description: "India's 18th general election held in 7 phases across the country. NDA won 293 seats, INDIA Alliance 232 seats. Narendra Modi elected Prime Minister for a third consecutive term.",
    electionType: "general" as const,
    status: "completed" as const,
    startDate: "2024-04-19",
    endDate: "2024-06-01",
    state: "All India",
    constituency: "National",
    candidates: [
      { name: "Narendra Modi", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Varanasi, Uttar Pradesh", state: "Uttar Pradesh", age: 73, education: "MA (Political Science)", bio: "Prime Minister of India. Won Varanasi by a margin of 152,513 votes. Won 3rd consecutive term as PM.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Narendra_Modi_-_Sketch_%28Cropped%29.jpg/220px-Narendra_Modi_-_Sketch_%28Cropped%29.jpg" },
      { name: "Rahul Gandhi", partyName: "Indian National Congress (INC)", partySymbol: "✋", constituency: "Rae Bareli, Uttar Pradesh", state: "Uttar Pradesh", age: 53, education: "MPhil, University of Cambridge", bio: "Leader of Opposition in 18th Lok Sabha. Won Rae Bareli by 390,030 votes. Also won Wayanad (vacated for sister Priyanka Gandhi).", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Rahul_Gandhi.png/220px-Rahul_Gandhi.png" },
      { name: "Amit Shah", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Gandhinagar, Gujarat", state: "Gujarat", age: 59, education: "BSc (Biochemistry)", bio: "Home Minister of India. Won Gandhinagar with a margin of 744,716 votes — one of the highest margins in 2024 elections.", imageUrl: "" },
      { name: "Akhilesh Yadav", partyName: "Samajwadi Party (SP)", partySymbol: "🚲", constituency: "Kannauj, Uttar Pradesh", state: "Uttar Pradesh", age: 50, education: "BE (Industrial Engineering)", bio: "SP President and former CM of UP. Won Kannauj by 170,922 votes. Led SP to its best-ever performance with 37 Lok Sabha seats.", imageUrl: "" },
      { name: "Mallikarjun Kharge", partyName: "Indian National Congress (INC)", partySymbol: "✋", constituency: "Rajya Sabha (Party President)", state: "Karnataka", age: 81, education: "LLB", bio: "INC National President. Orchestrated INDIA Alliance coalition. Congress won 99 seats — significant improvement from 2019.", imageUrl: "" },
      { name: "Rajnath Singh", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Lucknow, Uttar Pradesh", state: "Uttar Pradesh", age: 73, education: "MSc (Physics)", bio: "Defence Minister of India. Won Lucknow by 338,878 votes. Retained seat for 3rd consecutive time.", imageUrl: "" },
    ],
  },
  {
    title: "Delhi Legislative Assembly Election 2025",
    description: "Delhi's 7th Legislative Assembly election. BJP ended 10 years of AAP rule, winning 48 of 70 seats. AAP suffered historic defeat with Arvind Kejriwal losing from New Delhi constituency.",
    electionType: "state" as const,
    status: "completed" as const,
    startDate: "2025-02-05",
    endDate: "2025-02-05",
    state: "Delhi",
    constituency: "All 70 Constituencies",
    candidates: [
      { name: "Parvesh Verma", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "New Delhi", state: "Delhi", age: 46, education: "BA (History)", bio: "Son of former CM Sahib Singh Verma. Defeated Arvind Kejriwal in New Delhi constituency by 3,862 votes. Key BJP leader in Delhi.", imageUrl: "" },
      { name: "Arvind Kejriwal", partyName: "Aam Aadmi Party (AAP)", partySymbol: "🧹", constituency: "New Delhi", state: "Delhi", age: 56, education: "BTech (Mechanical Engineering), IIT Kharagpur", bio: "Former 3-term CM of Delhi. Lost New Delhi seat to Parvesh Verma. Resigned as CM after 2024 Supreme Court order; focused on party revival after bail.", imageUrl: "" },
      { name: "Rekha Gupta", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Shalimar Bagh", state: "Delhi", age: 52, education: "BA", bio: "Elected Chief Minister of Delhi after BJP's landslide. Former Delhi Mayor (2008). Won Shalimar Bagh by comfortable margin.", imageUrl: "" },
      { name: "Atishi", partyName: "Aam Aadmi Party (AAP)", partySymbol: "🧹", constituency: "Kalkaji", state: "Delhi", age: 43, education: "MA (History), Oxford University", bio: "Former Education Minister of Delhi. Lost Kalkaji constituency. Was briefly CM of Delhi before 2025 elections.", imageUrl: "" },
      { name: "Manish Sisodia", partyName: "Aam Aadmi Party (AAP)", partySymbol: "🧹", constituency: "Jangpura", state: "Delhi", age: 52, education: "BA (Journalism)", bio: "Former Deputy CM of Delhi. Lost Jangpura constituency after spending 17 months in Tihar jail in Delhi liquor policy case.", imageUrl: "" },
      { name: "Sandeep Dikshit", partyName: "Indian National Congress (INC)", partySymbol: "✋", constituency: "New Delhi", state: "Delhi", age: 61, education: "BSc, MBA", bio: "Son of former Delhi CM Sheila Dikshit. Contested New Delhi constituency against Kejriwal and Parvesh Verma. Congress won 0 seats.", imageUrl: "" },
    ],
  },
  {
    title: "Bihar Legislative Assembly Election 2025",
    description: "Bihar's upcoming 17th Legislative Assembly election. Expected to be a closely contested battle between NDA (JD-U + BJP) led by CM Nitish Kumar and INDIA Alliance led by Tejashwi Yadav's RJD.",
    electionType: "state" as const,
    status: "upcoming" as const,
    startDate: "2025-10-28",
    endDate: "2025-11-03",
    state: "Bihar",
    constituency: "All 243 Constituencies",
    candidates: [
      { name: "Nitish Kumar", partyName: "Janata Dal (United) — JD(U)", partySymbol: "🏹", constituency: "Nalanda", state: "Bihar", age: 74, education: "BE (Electrical Engineering)", bio: "Incumbent Chief Minister of Bihar. 9-time CM. Switched back to NDA alliance in January 2024. Seeking another term.", imageUrl: "" },
      { name: "Tejashwi Yadav", partyName: "Rashtriya Janata Dal (RJD)", partySymbol: "⚡", constituency: "Raghopur", state: "Bihar", age: 35, education: "Class 10", bio: "Former Deputy CM of Bihar. Son of Lalu Prasad Yadav. Leading INDIA Alliance in Bihar. Strongest opposition candidate for CM.", imageUrl: "" },
      { name: "Chirag Paswan", partyName: "Lok Janshakti Party (Ram Vilas) — LJPR", partySymbol: "🔦", constituency: "Hajipur (Lok Sabha)", state: "Bihar", age: 41, education: "BA", bio: "Union Cabinet Minister and son of Ram Vilas Paswan. LJPR is part of NDA. Expected to play key role in Bihar election campaigning.", imageUrl: "" },
      { name: "Samrat Choudhary", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Bikramganj", state: "Bihar", age: 55, education: "BA", bio: "Deputy CM of Bihar. Bihar BJP President. Leading BJP's election campaign in the state.", imageUrl: "" },
    ],
  },
  {
    title: "West Bengal Legislative Assembly Election 2026",
    description: "West Bengal's 17th Legislative Assembly election. TMC led by CM Mamata Banerjee will defend its majority. BJP, Left Front and Congress form opposition.",
    electionType: "state" as const,
    status: "upcoming" as const,
    startDate: "2026-04-20",
    endDate: "2026-04-27",
    state: "West Bengal",
    constituency: "All 294 Constituencies",
    candidates: [
      { name: "Mamata Banerjee", partyName: "All India Trinamool Congress (TMC)", partySymbol: "🌸", constituency: "Bhawanipore", state: "West Bengal", age: 70, education: "LLB", bio: "Chief Minister of West Bengal since 2011. TMC founder. Seeking 4th consecutive term. Known as 'Didi' — most popular leader in Bengal.", imageUrl: "" },
      { name: "Suvendu Adhikari", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Nandigram", state: "West Bengal", age: 53, education: "BA", bio: "Leader of Opposition in West Bengal Assembly. Former TMC leader who joined BJP in 2020. Defeated Mamata Banerjee in Nandigram in 2021.", imageUrl: "" },
      { name: "Adhir Ranjan Chowdhury", partyName: "Indian National Congress (INC)", partySymbol: "✋", constituency: "Berhampore", state: "West Bengal", age: 69, education: "BA", bio: "Former MP from Berhampore (lost 2024 Lok Sabha). State Congress president. Leading Congress campaign in Bengal.", imageUrl: "" },
    ],
  },
  {
    title: "Kerala Legislative Assembly Election 2026",
    description: "Kerala's 16th Legislative Assembly election. LDF government led by CM Pinarayi Vijayan faces UDF alliance led by Congress and the new Democratic Alliance.",
    electionType: "state" as const,
    status: "upcoming" as const,
    startDate: "2026-04-23",
    endDate: "2026-04-23",
    state: "Kerala",
    constituency: "All 140 Constituencies",
    candidates: [
      { name: "Pinarayi Vijayan", partyName: "Communist Party of India (Marxist) — CPI(M)", partySymbol: "⚒️", constituency: "Dharmadom", state: "Kerala", age: 80, education: "BA", bio: "Incumbent Chief Minister of Kerala. LDF convener. Controversial but decisive administrator. Completed two terms in power.", imageUrl: "" },
      { name: "V.D. Satheesan", partyName: "Indian National Congress (INC)", partySymbol: "✋", constituency: "Perinthalmanna", state: "Kerala", age: 57, education: "LLB", bio: "Leader of Opposition in Kerala. Strong critic of Pinarayi govt. UDF CM candidate for 2026 elections.", imageUrl: "" },
      { name: "Suresh Gopi", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Thrissur", state: "Kerala", age: 67, education: "MA", bio: "Veteran Malayalam film actor and Union Minister. Won Thrissur Lok Sabha seat 2024 — BJP's first ever MP from Kerala. Expected to campaign hard in 2026.", imageUrl: "" },
    ],
  },
  {
    title: "Tamil Nadu Legislative Assembly Election 2026",
    description: "Tamil Nadu's 17th Legislative Assembly election. DMK government led by CM M.K. Stalin faces AIADMK and NDA challenge.",
    electionType: "state" as const,
    status: "upcoming" as const,
    startDate: "2026-05-20",
    endDate: "2026-05-20",
    state: "Tamil Nadu",
    constituency: "All 234 Constituencies",
    candidates: [
      { name: "M.K. Stalin", partyName: "Dravida Munnetra Kazhagam (DMK)", partySymbol: "🌅", constituency: "Kolathur", state: "Tamil Nadu", age: 71, education: "BA", bio: "Chief Minister of Tamil Nadu. Son of DMK founder M. Karunanidhi. Seeking 2nd term. Led DMK to biggest-ever victory in 2021.", imageUrl: "" },
      { name: "Edappadi K. Palaniswami", partyName: "All India Anna Dravida Munnetra Kazhagam (AIADMK)", partySymbol: "🌿", constituency: "Edappadi", state: "Tamil Nadu", age: 70, education: "Class 12", bio: "Leader of Opposition and AIADMK General Secretary. Former CM of Tamil Nadu (2017–2021). Main rival to Stalin.", imageUrl: "" },
      { name: "Udhayanidhi Stalin", partyName: "Dravida Munnetra Kazhagam (DMK)", partySymbol: "🌅", constituency: "Chepauk–Thiruvallikeni", state: "Tamil Nadu", age: 47, education: "BA", bio: "Deputy CM of Tamil Nadu and Sports/Youth Minister. Son of CM M.K. Stalin. Film producer-turned-politician. Strong youth appeal.", imageUrl: "" },
    ],
  },
  {
    title: "Madhya Pradesh By-Elections 2025",
    description: "By-elections for multiple seats in Madhya Pradesh vacated due to MP and MLA appointments. BJP holds all contested seats currently.",
    electionType: "bypolls" as const,
    status: "upcoming" as const,
    startDate: "2025-07-15",
    endDate: "2025-07-15",
    state: "Madhya Pradesh",
    constituency: "Multiple Constituencies",
    candidates: [
      { name: "Jyotiraditya Scindia", partyName: "Bharatiya Janata Party (BJP)", partySymbol: "🪷", constituency: "Guna (Lok Sabha)", state: "Madhya Pradesh", age: 54, education: "MBA, Harvard Business School", bio: "Union Cabinet Minister (Civil Aviation). Joined BJP from Congress in 2020 triggering collapse of Kamal Nath govt. Strong influence on MP politics.", imageUrl: "" },
      { name: "Kamal Nath", partyName: "Indian National Congress (INC)", partySymbol: "✋", constituency: "Chhindwara", state: "Madhya Pradesh", age: 77, education: "BA", bio: "Former CM of MP and senior Congress leader. His son Nakul Nath represents Chhindwara in Lok Sabha. INC's face in MP.", imageUrl: "" },
    ],
  },
];

export async function seedRealElections(): Promise<void> {
  const [existing] = await db.select({ count: count() }).from(electionsTable)
    .where(eq(electionsTable.state, "All India"));

  if (Number(existing?.count) > 0) {
    logger.info("Real elections already seeded — skipping");
    return;
  }

  logger.info("Seeding real Indian elections and candidates...");

  for (const electionData of REAL_ELECTIONS) {
    const { candidates: candidateData, ...electionFields } = electionData;

    const [election] = await db.insert(electionsTable).values(electionFields).returning();
    logger.info({ id: election.id, title: election.title }, "Election seeded");

    for (const c of candidateData) {
      await db.insert(candidatesTable).values({ ...c, electionId: election.id });
    }
    logger.info({ electionId: election.id, count: candidateData.length }, "Candidates seeded");
  }

  logger.info("Real Indian election seeding complete");
}
