import { validatePhases } from './utils';

describe('validatePhases', () => {
  it('should return true if all phases are valid', () => {
    const phases = [
      { from: new Date('2024-08-01'), to: new Date('2024-09-05') },
      { from: new Date('2024-09-10'), to: new Date('2024-09-20') },
      { from: new Date('2024-09-21'), to: new Date('2024-10-28') },
    ];

    expect(validatePhases(phases)).toBe(true);
  });

  it('should return true if for one phase the start and end are the same (one day phase)', () => {
    const phases = [
      { from: new Date('2024-08-01'), to: new Date('2024-08-01') },
    ];

    expect(validatePhases(phases)).toBe(true);
  });

  it("should return false if one phase's end date is the same as the next phase's start date", () => {
    const phases = [
      { from: new Date('2024-08-01'), to: new Date('2024-09-05') },
      { from: new Date('2024-09-05'), to: new Date('2024-09-20') },
    ];

    expect(validatePhases(phases)).toBe(false);
  });
});
