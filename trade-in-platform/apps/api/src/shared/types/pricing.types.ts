export type DefectSeverity = 1 | 2 | 3 | 4 | 5;

export interface PriceBreakdown {
  basePrice: number;
  testDeductions: number;
  defectDeductions: number;
  finalPrice: number;
}
