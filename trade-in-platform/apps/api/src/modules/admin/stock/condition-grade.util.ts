/**
 * Calculates a condition grade (A/B/C/D) from a list of defects.
 *
 * Grade mapping:
 * - A: avg severity <= 1.5 AND defect count <= 1 (or no defects)
 * - B: avg severity <= 2.5 AND defect count <= 3
 * - C: avg severity <= 3.5 AND defect count <= 5
 * - D: everything else
 */
export function calculateConditionGrade(
  defects: { severity: number }[],
): string {
  if (defects.length === 0) return 'A';

  const avgSeverity =
    defects.reduce((sum, d) => sum + d.severity, 0) / defects.length;
  const count = defects.length;

  if (avgSeverity <= 1.5 && count <= 1) return 'A';
  if (avgSeverity <= 2.5 && count <= 3) return 'B';
  if (avgSeverity <= 3.5 && count <= 5) return 'C';
  return 'D';
}
