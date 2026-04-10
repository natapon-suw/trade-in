import * as fc from 'fast-check';

import { calculateConditionGrade } from './condition-grade.util';

// Arbitrary: single defect with severity 1-5
const defectArb = fc.record({
  severity: fc.integer({ min: 1, max: 5 }),
});

// Arbitrary: array of defects (0-20)
const defectsArb = fc.array(defectArb, { minLength: 0, maxLength: 20 });

// Grade ordering: A > B > C > D (lower index = better grade)
const GRADE_ORDER = ['A', 'B', 'C', 'D'] as const;

function gradeIndex(grade: string): number {
  return GRADE_ORDER.indexOf(grade as (typeof GRADE_ORDER)[number]);
}

describe('calculateConditionGrade PBT', () => {
  it('property: severity values are always between 1 and 5 (input constraint validation)', () => {
    fc.assert(
      fc.property(defectsArb, (defects) => {
        for (const d of defects) {
          expect(d.severity).toBeGreaterThanOrEqual(1);
          expect(d.severity).toBeLessThanOrEqual(5);
        }
        // Function should still return a valid grade for any valid input
        const grade = calculateConditionGrade(defects);
        expect(GRADE_ORDER).toContain(grade);
      }),
      { numRuns: 200 },
    );
  });

  it('property: condition grade is always one of A, B, C, D', () => {
    fc.assert(
      fc.property(defectsArb, (defects) => {
        const grade = calculateConditionGrade(defects);
        expect(['A', 'B', 'C', 'D']).toContain(grade);
      }),
      { numRuns: 200 },
    );
  });

  it('property: no defects always returns grade A', () => {
    fc.assert(
      fc.property(
        fc.constant([] as { severity: number }[]),
        (defects) => {
          expect(calculateConditionGrade(defects)).toBe('A');
        },
      ),
      { numRuns: 10 },
    );
  });

  it('property: grade ordering is consistent — lower avg severity AND fewer defects yields equal or better grade', () => {
    fc.assert(
      fc.property(
        // defects1: smaller set with lower severities
        fc.array(fc.record({ severity: fc.integer({ min: 1, max: 3 }) }), {
          minLength: 1,
          maxLength: 3,
        }),
        // extra defects to append for defects2
        fc.array(fc.record({ severity: fc.integer({ min: 3, max: 5 }) }), {
          minLength: 1,
          maxLength: 5,
        }),
        (defects1, extraDefects) => {
          const defects2 = [...defects1, ...extraDefects];

          const avg1 =
            defects1.reduce((s, d) => s + d.severity, 0) / defects1.length;
          const avg2 =
            defects2.reduce((s, d) => s + d.severity, 0) / defects2.length;

          // Only assert when defects1 is strictly "better" on both axes
          if (avg1 <= avg2 && defects1.length <= defects2.length) {
            const grade1 = calculateConditionGrade(defects1);
            const grade2 = calculateConditionGrade(defects2);

            // grade1 should be equal or better (lower index) than grade2
            expect(gradeIndex(grade1)).toBeLessThanOrEqual(gradeIndex(grade2));
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('property: adding a high-severity defect never improves the grade', () => {
    fc.assert(
      fc.property(
        fc.array(defectArb, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 4, max: 5 }), // high severity to add
        (defects, highSeverity) => {
          const gradeBefore = calculateConditionGrade(defects);
          const gradeAfter = calculateConditionGrade([
            ...defects,
            { severity: highSeverity },
          ]);

          // Adding a high-severity defect should never improve the grade
          expect(gradeIndex(gradeAfter)).toBeGreaterThanOrEqual(
            gradeIndex(gradeBefore),
          );
        },
      ),
      { numRuns: 200 },
    );
  });

  // Deterministic boundary checks to verify the grade mapping
  describe('defect-to-grade mapping correctness', () => {
    it('single defect severity 1 → grade A', () => {
      expect(calculateConditionGrade([{ severity: 1 }])).toBe('A');
    });

    it('single defect severity 2 → grade B (avg 2.0, count 1)', () => {
      // avg=2.0 <= 2.5 AND count=1 <= 3 → B
      // But also avg=2.0 > 1.5 so not A
      expect(calculateConditionGrade([{ severity: 2 }])).toBe('B');
    });

    it('3 defects avg severity 2.5 → grade B', () => {
      expect(
        calculateConditionGrade([
          { severity: 2 },
          { severity: 3 },
          { severity: 2 },
        ]),
      ).toBe('B');
    });

    it('5 defects avg severity 3.0 → grade C', () => {
      expect(
        calculateConditionGrade([
          { severity: 3 },
          { severity: 3 },
          { severity: 3 },
          { severity: 3 },
          { severity: 3 },
        ]),
      ).toBe('C');
    });

    it('6 defects any severity → grade D (count > 5)', () => {
      expect(
        calculateConditionGrade([
          { severity: 1 },
          { severity: 1 },
          { severity: 1 },
          { severity: 1 },
          { severity: 1 },
          { severity: 1 },
        ]),
      ).toBe('D');
    });

    it('3 defects avg severity 4.0 → grade D (avg > 3.5)', () => {
      expect(
        calculateConditionGrade([
          { severity: 4 },
          { severity: 4 },
          { severity: 4 },
        ]),
      ).toBe('D');
    });
  });
});
