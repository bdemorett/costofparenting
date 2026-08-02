/**
 * Illustrative state-level family tax credits and dependent-care assistance.
 * Planning summaries only — verify eligibility and current program rules locally.
 */

export type SubsidyProgram = {
  name: string;
  kind: "tax_credit" | "dependent_care" | "prek" | "assistance";
  summary: string;
  /** Typical annual or monthly planning note for families. */
  planningNote: string;
};

export type StateSubsidyProfile = {
  stateCode: string;
  stateName: string;
  /** Rough median household income index vs national (1.0 = national). */
  medianIncomeIndex: number;
  /** Dependent exemption / credit framing for commentary. */
  dependentTaxFraming: string;
  programs: SubsidyProgram[];
};

const DEFAULT_PROGRAMS: SubsidyProgram[] = [
  {
    name: "Federal Child Tax Credit",
    kind: "tax_credit",
    summary:
      "Federal CTC may reduce tax liability for qualifying dependents; amount phases with income.",
    planningNote: "Model federal CTC separately from state credits when stress-testing Year 1 cash flow.",
  },
  {
    name: "Dependent Care FSA / federal credit",
    kind: "dependent_care",
    summary:
      "Employer Dependent Care FSAs and the federal Child and Dependent Care Credit can offset eligible daycare costs.",
    planningNote: "Coordinate FSA elections with projected infant center-care invoices before open enrollment.",
  },
];

export const STATE_SUBSIDY_PROFILES: Record<string, StateSubsidyProfile> = {
  TX: {
    stateCode: "TX",
    stateName: "Texas",
    medianIncomeIndex: 0.97,
    dependentTaxFraming:
      "Texas has no state personal income tax, so dependent credits are primarily federal — local relief often comes via workforce-board childcare subsidies and property-tax homestead rules.",
    programs: [
      {
        name: "Texas Workforce Commission childcare subsidies",
        kind: "assistance",
        summary:
          "Income-eligible families may receive help paying for licensed care through local workforce boards.",
        planningNote: "Waitlists vary by county; apply early if infant slots are scarce in your metro.",
      },
      {
        name: "Texas Public Pre-K (eligible districts)",
        kind: "prek",
        summary:
          "Many districts offer free or reduced Pre-K for qualifying 3–4 year olds.",
        planningNote: "District eligibility can cut a full preschool year out of the toddler cost stack.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  CA: {
    stateCode: "CA",
    stateName: "California",
    medianIncomeIndex: 1.18,
    dependentTaxFraming:
      "California offers a Young Child Tax Credit for qualifying low-income families with a child under 6, layered on federal credits — valuable when infant care is among the nation’s highest.",
    programs: [
      {
        name: "California Young Child Tax Credit",
        kind: "tax_credit",
        summary:
          "Refundable credit for qualifying households with a child under age 6 meeting income rules.",
        planningNote: "Pair with CalEITC modeling when estimating after-tax cash for Year 1.",
      },
      {
        name: "CalWORKs Child Care",
        kind: "assistance",
        summary:
          "Supports eligible families with payments to approved childcare providers.",
        planningNote: "Provider payment rates and parent co-pays differ by county.",
      },
      {
        name: "California State Preschool Program",
        kind: "prek",
        summary:
          "Part- and full-day preschool for income-eligible 3–4 year olds in many communities.",
        planningNote: "Can materially reduce toddler private-preschool spend where seats exist.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  NY: {
    stateCode: "NY",
    stateName: "New York",
    medianIncomeIndex: 1.12,
    dependentTaxFraming:
      "New York’s Empire State Child Credit and dependent exemptions help offset high NYC-area care costs, though market-rate infant care still dominates budgets.",
    programs: [
      {
        name: "Empire State Child Credit",
        kind: "tax_credit",
        summary:
          "State credit for qualifying dependents; amounts and phaseouts follow NY tax rules.",
        planningNote: "Useful cash-flow offset when modeling after-tax income during unpaid leave weeks.",
      },
      {
        name: "NY Child Care Assistance Program",
        kind: "assistance",
        summary:
          "Subsidies for eligible families using approved childcare providers.",
        planningNote: "Income ceilings and co-pays vary by local social services district.",
      },
      {
        name: "Universal Pre-K / 3-K (select cities)",
        kind: "prek",
        summary:
          "Expanded public Pre-K and 3-K seats in NYC and other districts reduce private preschool pressure.",
        planningNote: "Lottery/assignment timing matters — plan toddler budgets with waitlist risk.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  FL: {
    stateCode: "FL",
    stateName: "Florida",
    medianIncomeIndex: 0.94,
    dependentTaxFraming:
      "Florida has no state income tax; family relief skews toward Voluntary Pre-K and school-readiness subsidies rather than a state child tax credit.",
    programs: [
      {
        name: "Florida Voluntary Prekindergarten (VPK)",
        kind: "prek",
        summary:
          "Free Pre-K hours for eligible 4-year-olds statewide.",
        planningNote: "VPK hours rarely cover full-day working schedules — budget wraparound care separately.",
      },
      {
        name: "School Readiness Program",
        kind: "assistance",
        summary:
          "Helps eligible families pay for early care and education.",
        planningNote: "Eligibility and provider networks are administered locally.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  WA: {
    stateCode: "WA",
    stateName: "Washington",
    medianIncomeIndex: 1.14,
    dependentTaxFraming:
      "Washington has no state wage income tax; Working Connections Child Care and ECEAP are the main state levers against high Seattle-area infant rates.",
    programs: [
      {
        name: "Working Connections Child Care",
        kind: "assistance",
        summary:
          "Subsidizes childcare for eligible working families.",
        planningNote: "Co-pays and authorization periods should be modeled against return-to-work dates.",
      },
      {
        name: "ECEAP / Early ECEAP",
        kind: "prek",
        summary:
          "Comprehensive preschool for eligible young children.",
        planningNote: "Can replace a private toddler preschool year where seats are available.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  IL: {
    stateCode: "IL",
    stateName: "Illinois",
    medianIncomeIndex: 1.01,
    dependentTaxFraming:
      "Illinois layers a state EITC and dependent exemptions on federal credits — helpful for Chicago-area middle incomes facing elevated daycare.",
    programs: [
      {
        name: "Illinois Earned Income Credit",
        kind: "tax_credit",
        summary:
          "State EITC percentage of the federal credit for qualifying filers.",
        planningNote: "Combine with federal CTC when estimating net Year 1 capacity.",
      },
      {
        name: "Child Care Assistance Program (CCAP)",
        kind: "assistance",
        summary:
          "Helps eligible Illinois families pay for childcare.",
        planningNote: "Parent fees scale with income; verify county caseload timelines.",
      },
      {
        name: "Preschool for All / Prevention Initiative",
        kind: "prek",
        summary:
          "Public early childhood slots for qualifying children in many districts.",
        planningNote: "Reduces private preschool pressure in the toddler years.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  CO: {
    stateCode: "CO",
    stateName: "Colorado",
    medianIncomeIndex: 1.08,
    dependentTaxFraming:
      "Colorado’s Child Tax Credit and expanding universal preschool shift toddler cost curves, while Denver housing premiums remain the larger long-run driver.",
    programs: [
      {
        name: "Colorado Child Tax Credit",
        kind: "tax_credit",
        summary:
          "State credit for qualifying children under income thresholds.",
        planningNote: "Treat as an annual cash offset, not a monthly childcare voucher.",
      },
      {
        name: "Colorado Universal Preschool",
        kind: "prek",
        summary:
          "Funded preschool hours for eligible 4-year-olds (and some younger children).",
        planningNote: "Hours may not cover full-time schedules — budget wraparound care.",
      },
      {
        name: "Colorado Child Care Assistance Program",
        kind: "assistance",
        summary:
          "Subsidies for eligible families using approved providers.",
        planningNote: "Provider rates and parent fees vary by county.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  MA: {
    stateCode: "MA",
    stateName: "Massachusetts",
    medianIncomeIndex: 1.22,
    dependentTaxFraming:
      "Massachusetts dependent exemptions and childcare assistance help on the margin, but Greater Boston infant care rates still set the pace for Year 1 budgets.",
    programs: [
      {
        name: "Massachusetts Dependent Care / childcare subsidies",
        kind: "assistance",
        summary:
          "Income-eligible families may receive help through state childcare financial assistance.",
        planningNote: "Authorization wait times can extend unpaid leave cash-flow risk.",
      },
      {
        name: "Public Pre-K / Head Start partnerships",
        kind: "prek",
        summary:
          "District and community preschool options for qualifying children.",
        planningNote: "Seat scarcity means many families still budget private toddler care.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  GA: {
    stateCode: "GA",
    stateName: "Georgia",
    medianIncomeIndex: 0.96,
    dependentTaxFraming:
      "Georgia’s lottery-funded Pre-K and quality-rated care subsidies are the primary state offsets; dependent exemptions are modest versus private infant care.",
    programs: [
      {
        name: "Georgia’s Pre-K Program",
        kind: "prek",
        summary:
          "Lottery-funded Pre-K for eligible 4-year-olds.",
        planningNote: "Strong toddler-year offset where seats are available near your commute.",
      },
      {
        name: "Childcare and Parent Services (CAPS)",
        kind: "assistance",
        summary:
          "Helps eligible families pay for quality-rated childcare.",
        planningNote: "Provider quality ratings affect reimbursement — shop CAPS-ready centers early.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  AZ: {
    stateCode: "AZ",
    stateName: "Arizona",
    medianIncomeIndex: 0.95,
    dependentTaxFraming:
      "Arizona’s lower state income tax and ESA options change education tradeoffs; childcare assistance still matters most in the infant years.",
    programs: [
      {
        name: "Arizona DES Child Care Assistance",
        kind: "assistance",
        summary:
          "Subsidies for eligible families using approved providers.",
        planningNote: "Co-pays and authorization periods should match return-to-work planning.",
      },
      {
        name: "Quality First / public preschool partnerships",
        kind: "prek",
        summary:
          "Quality-rated early learning and district preschool seats in many communities.",
        planningNote: "Can reduce private toddler tuition where available.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  PA: {
    stateCode: "PA",
    stateName: "Pennsylvania",
    medianIncomeIndex: 1.0,
    dependentTaxFraming:
      "Pennsylvania dependent exemptions and Child Care Works subsidies help Philadelphia and Pittsburgh families manage elevated early-care rates.",
    programs: [
      {
        name: "Child Care Works",
        kind: "assistance",
        summary:
          "Pennsylvania’s childcare subsidy program for eligible families.",
        planningNote: "County waitlists can be long — apply before leave ends.",
      },
      {
        name: "PA Pre-K Counts / Head Start",
        kind: "prek",
        summary:
          "Publicly funded preschool for qualifying children.",
        planningNote: "Seat availability varies sharply by county.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  OR: {
    stateCode: "OR",
    stateName: "Oregon",
    medianIncomeIndex: 1.02,
    dependentTaxFraming:
      "Oregon’s Working Family Household and Dependent Care Credit can offset daycare invoices for qualifying filers in Portland-area budgets.",
    programs: [
      {
        name: "Working Family Household and Dependent Care Credit",
        kind: "tax_credit",
        summary:
          "State credit related to dependent care expenses for qualifying households.",
        planningNote: "Keep daycare receipts aligned with tax-year documentation.",
      },
      {
        name: "ERDC childcare subsidy",
        kind: "assistance",
        summary:
          "Employment Related Day Care helps eligible working families.",
        planningNote: "Co-pays scale with income; model against post-leave months.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  TN: {
    stateCode: "TN",
    stateName: "Tennessee",
    medianIncomeIndex: 0.92,
    dependentTaxFraming:
      "Tennessee has no wage income tax; Smart Steps and voluntary Pre-K are the main state childcare offsets for Nashville and Memphis families.",
    programs: [
      {
        name: "Smart Steps Child Care Payment Assistance",
        kind: "assistance",
        summary:
          "Helps eligible Tennessee families pay for childcare.",
        planningNote: "Provider networks and parent fees vary by region.",
      },
      {
        name: "Tennessee Voluntary Pre-K",
        kind: "prek",
        summary:
          "Public Pre-K seats for qualifying children in participating districts.",
        planningNote: "Not universal — budget private toddler care as the base case.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  NC: {
    stateCode: "NC",
    stateName: "North Carolina",
    medianIncomeIndex: 0.95,
    dependentTaxFraming:
      "North Carolina dependent exemptions and NC Pre-K / subsidy programs temper Charlotte and Raleigh toddler costs more than infant center rates.",
    programs: [
      {
        name: "NC Child Care Subsidy",
        kind: "assistance",
        summary:
          "Helps eligible families afford licensed care.",
        planningNote: "County administration means timelines differ across metros.",
      },
      {
        name: "NC Pre-K",
        kind: "prek",
        summary:
          "Public Pre-K for eligible 4-year-olds.",
        planningNote: "Strong offset for the final toddler year where seats exist.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  MN: {
    stateCode: "MN",
    stateName: "Minnesota",
    medianIncomeIndex: 1.06,
    dependentTaxFraming:
      "Minnesota’s Working Family Credit and childcare assistance programs help Twin Cities families facing above-average early-care wages.",
    programs: [
      {
        name: "Minnesota Working Family Credit",
        kind: "tax_credit",
        summary:
          "State credit that can boost after-tax income for qualifying workers with children.",
        planningNote: "Stack with federal CTC when estimating Year 1 surplus.",
      },
      {
        name: "Child Care Assistance Program",
        kind: "assistance",
        summary:
          "Helps eligible families pay for childcare.",
        planningNote: "Authorization delays can create cash-flow gaps after leave.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  MI: {
    stateCode: "MI",
    stateName: "Michigan",
    medianIncomeIndex: 0.94,
    dependentTaxFraming:
      "Michigan dependent exemptions and childcare subsidies matter most outside Detroit’s lower housing markets, where care can still outpace local wages.",
    programs: [
      {
        name: "Michigan Child Development and Care (CDC)",
        kind: "assistance",
        summary:
          "Subsidizes childcare for eligible families.",
        planningNote: "Provider payment rates influence which centers accept CDC.",
      },
      {
        name: "Great Start Readiness Program",
        kind: "prek",
        summary:
          "Public preschool for eligible 4-year-olds.",
        planningNote: "Can replace a private preschool year in participating ISDs.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  NV: {
    stateCode: "NV",
    stateName: "Nevada",
    medianIncomeIndex: 0.93,
    dependentTaxFraming:
      "Nevada has no state income tax; childcare subsidies and Pre-K partnerships are the main public offsets for Las Vegas families.",
    programs: [
      {
        name: "Nevada Child Care Subsidy Program",
        kind: "assistance",
        summary:
          "Helps eligible families afford childcare.",
        planningNote: "Model co-pays against post-leave months when infant care peaks.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  UT: {
    stateCode: "UT",
    stateName: "Utah",
    medianIncomeIndex: 1.0,
    dependentTaxFraming:
      "Utah dependent exemptions and childcare assistance help Salt Lake families, though housing growth can still outrun wage gains.",
    programs: [
      {
        name: "Utah Child Care Assistance",
        kind: "assistance",
        summary:
          "Subsidies for eligible families using approved providers.",
        planningNote: "Check Office of Child Care guidance for current income ceilings.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  MO: {
    stateCode: "MO",
    stateName: "Missouri",
    medianIncomeIndex: 0.91,
    dependentTaxFraming:
      "Missouri dependent exemptions and childcare subsidies keep Kansas City and St. Louis budgets closer to Midwestern peers.",
    programs: [
      {
        name: "Missouri Child Care Subsidy",
        kind: "assistance",
        summary:
          "Helps eligible families pay for childcare.",
        planningNote: "Sliding fees should be included in after-leave monthly totals.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  OH: {
    stateCode: "OH",
    stateName: "Ohio",
    medianIncomeIndex: 0.93,
    dependentTaxFraming:
      "Ohio dependent credits/exemptions and publicly funded childcare support Columbus, Cleveland, and Cincinnati families with mid-tier care rates.",
    programs: [
      {
        name: "Publicly Funded Child Care (PFCC)",
        kind: "assistance",
        summary:
          "Ohio’s subsidy program for eligible families.",
        planningNote: "Copay schedules change with income — revisit after parental leave.",
      },
      {
        name: "Early Childhood Education Grant / district Pre-K",
        kind: "prek",
        summary:
          "Public preschool seats in many districts for qualifying children.",
        planningNote: "Availability is uneven across metros.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  IN: {
    stateCode: "IN",
    stateName: "Indiana",
    medianIncomeIndex: 0.92,
    dependentTaxFraming:
      "Indiana dependent exemptions and CCDF subsidies help Indianapolis families keep infant care from overwhelming midwestern wage levels.",
    programs: [
      {
        name: "Indiana CCDF / On My Way Pre-K",
        kind: "assistance",
        summary:
          "Childcare subsidies and Pre-K scholarships for eligible families.",
        planningNote: "Scholarship timing can determine whether private preschool is needed.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  WI: {
    stateCode: "WI",
    stateName: "Wisconsin",
    medianIncomeIndex: 0.98,
    dependentTaxFraming:
      "Wisconsin dependent exemptions and Wisconsin Shares childcare subsidies support Milwaukee and Madison households.",
    programs: [
      {
        name: "Wisconsin Shares",
        kind: "assistance",
        summary:
          "Childcare subsidy program for eligible working families.",
        planningNote: "Authorization hours should match full-time return-to-work schedules.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  MD: {
    stateCode: "MD",
    stateName: "Maryland",
    medianIncomeIndex: 1.16,
    dependentTaxFraming:
      "Maryland’s Child Tax Credit expansions and childcare scholarships help Baltimore-area families facing Northeast care prices.",
    programs: [
      {
        name: "Maryland Child Tax Credit / dependent benefits",
        kind: "tax_credit",
        summary:
          "State-level child-related credits for qualifying filers (rules evolve with the tax code).",
        planningNote: "Confirm current-year credit amounts with a tax professional.",
      },
      {
        name: "Child Care Scholarship Program",
        kind: "assistance",
        summary:
          "Helps eligible families pay for childcare.",
        planningNote: "Provider participation varies — call centers before signing contracts.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  DC: {
    stateCode: "DC",
    stateName: "District of Columbia",
    medianIncomeIndex: 1.25,
    dependentTaxFraming:
      "D.C.’s robust early childhood investments and local tax benefits help offset some of the nation’s highest metro care costs — but housing still dominates.",
    programs: [
      {
        name: "D.C. Child Care Subsidy Program",
        kind: "assistance",
        summary:
          "Subsidies for eligible District families.",
        planningNote: "Co-pays and provider networks should be verified before leave ends.",
      },
      {
        name: "D.C. Universal Pre-K",
        kind: "prek",
        summary:
          "Public Pre-K seats for 3- and 4-year-olds.",
        planningNote: "Strong toddler-year offset versus private preschool.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  OK: {
    stateCode: "OK",
    stateName: "Oklahoma",
    medianIncomeIndex: 0.86,
    dependentTaxFraming:
      "Oklahoma dependent exemptions and childcare subsidies matter in Oklahoma City, where lower housing costs can still collide with scarce infant slots.",
    programs: [
      {
        name: "Oklahoma Child Care Subsidy",
        kind: "assistance",
        summary:
          "Helps eligible families afford childcare.",
        planningNote: "Include parent fees in monthly after-leave budgets.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  KY: {
    stateCode: "KY",
    stateName: "Kentucky",
    medianIncomeIndex: 0.88,
    dependentTaxFraming:
      "Kentucky dependent credits and CCAP subsidies help Louisville families manage early-care costs relative to regional wages.",
    programs: [
      {
        name: "Kentucky CCAP",
        kind: "assistance",
        summary:
          "Child Care Assistance Program for eligible families.",
        planningNote: "Provider payment rates influence available center options.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  VA: {
    stateCode: "VA",
    stateName: "Virginia",
    medianIncomeIndex: 1.1,
    dependentTaxFraming:
      "Virginia dependent exemptions and childcare subsidies support Richmond and Northern Virginia families facing divergent housing markets.",
    programs: [
      {
        name: "Virginia Child Care Subsidy Program",
        kind: "assistance",
        summary:
          "Helps eligible families pay for childcare.",
        planningNote: "Local departments of social services administer cases — timelines vary.",
      },
      {
        name: "Virginia Preschool Initiative",
        kind: "prek",
        summary:
          "Public preschool for qualifying 4-year-olds in participating localities.",
        planningNote: "Seat supply is uneven across the state.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  ID: {
    stateCode: "ID",
    stateName: "Idaho",
    medianIncomeIndex: 0.9,
    dependentTaxFraming:
      "Idaho dependent exemptions and ICCP subsidies help Boise families as housing costs rise faster than historic local norms.",
    programs: [
      {
        name: "Idaho Child Care Program (ICCP)",
        kind: "assistance",
        summary:
          "Subsidizes childcare for eligible families.",
        planningNote: "Model co-pays against dual-income return-to-work months.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  NM: {
    stateCode: "NM",
    stateName: "New Mexico",
    medianIncomeIndex: 0.84,
    dependentTaxFraming:
      "New Mexico’s child tax credit and early childhood investments are among the more generous Southwest offsets for Albuquerque and Santa Fe families.",
    programs: [
      {
        name: "New Mexico Child Tax Credit",
        kind: "tax_credit",
        summary:
          "State credit for qualifying dependents.",
        planningNote: "Treat as annual relief when sizing emergency savings.",
      },
      {
        name: "New Mexico Childcare Assistance",
        kind: "assistance",
        summary:
          "Helps eligible families afford childcare.",
        planningNote: "Provider networks and fees vary by region.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  HI: {
    stateCode: "HI",
    stateName: "Hawaii",
    medianIncomeIndex: 1.15,
    dependentTaxFraming:
      "Hawaii’s high cost of living and food prices amplify infant budgets; state childcare subsidies and dependent exemptions only partially close the gap.",
    programs: [
      {
        name: "Hawaii Child Care Subsidy / Preschool Open Doors",
        kind: "assistance",
        summary:
          "Supports eligible families with childcare and preschool costs.",
        planningNote: "Island-specific provider shortages can still force private market rates.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  AK: {
    stateCode: "AK",
    stateName: "Alaska",
    medianIncomeIndex: 1.08,
    dependentTaxFraming:
      "Alaska has no state income tax; the Permanent Fund Dividend and childcare assistance are key household offsets for Anchorage families facing high food and care prices.",
    programs: [
      {
        name: "Alaska Child Care Assistance Program",
        kind: "assistance",
        summary:
          "Helps eligible families pay for childcare.",
        planningNote: "Seasonal work patterns can affect authorization — plan leave carefully.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  MT: {
    stateCode: "MT",
    stateName: "Montana",
    medianIncomeIndex: 0.9,
    dependentTaxFraming:
      "Montana dependent exemptions and Best Beginnings scholarships help Bozeman-area families where housing premiums have surged.",
    programs: [
      {
        name: "Best Beginnings Child Care Scholarship",
        kind: "assistance",
        summary:
          "Helps eligible Montana families afford childcare.",
        planningNote: "Provider scarcity can limit options even with a scholarship.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  SC: {
    stateCode: "SC",
    stateName: "South Carolina",
    medianIncomeIndex: 0.9,
    dependentTaxFraming:
      "South Carolina dependent exemptions and ABC vouchers help Charleston families balance tourism-driven housing with early-care costs.",
    programs: [
      {
        name: "SC ABC Child Care Vouchers",
        kind: "assistance",
        summary:
          "Vouchers for eligible families using participating providers.",
        planningNote: "Confirm provider ABC participation before signing contracts.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
  NJ: {
    stateCode: "NJ",
    stateName: "New Jersey",
    medianIncomeIndex: 1.2,
    dependentTaxFraming:
      "New Jersey’s Child and Dependent Care Credit and preschool expansions help Jersey City families adjacent to NYC-level care markets.",
    programs: [
      {
        name: "NJ Child and Dependent Care Credit",
        kind: "tax_credit",
        summary:
          "State credit related to dependent care expenses for qualifying filers.",
        planningNote: "Keep documentation aligned with federal dependent care claims.",
      },
      {
        name: "NJ Child Care Subsidy / Preschool Expansion",
        kind: "prek",
        summary:
          "Subsidies and expanding public preschool in many communities.",
        planningNote: "Public preschool can sharply cut toddler private tuition.",
      },
      ...DEFAULT_PROGRAMS,
    ],
  },
};

export function getStateSubsidyProfile(
  stateCode: string,
): StateSubsidyProfile {
  const code = String(stateCode || "")
    .trim()
    .toUpperCase();
  if (STATE_SUBSIDY_PROFILES[code]) {
    return STATE_SUBSIDY_PROFILES[code];
  }

  return {
    stateCode: code || "US",
    stateName: code || "United States",
    medianIncomeIndex: 1,
    dependentTaxFraming: `State-level dependent credits and childcare assistance vary widely in ${code || "this state"}. Layer federal CTC and Dependent Care Credit assumptions first, then confirm local Pre-K and subsidy eligibility.`,
    programs: DEFAULT_PROGRAMS,
  };
}
