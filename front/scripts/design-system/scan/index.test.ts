import { isAccepted } from './index';
import { Finding } from './schema';

const finding: Finding = {
  file: 'app/x.tsx',
  line: 10,
  col: 1,
  raw: '13px',
  category: 'px',
  confidence: 'low',
};

describe('isAccepted', () => {
  it('matches file and raw value with the line within 3', () => {
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', raw: '13px', line: 13 }])
    ).toBe(true);
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', value: '13px', line: 7 }])
    ).toBe(true);
    expect(isAccepted(finding, [{ file: 'app/x.tsx', raw: '13px' }])).toBe(
      true
    );
  });

  it('rejects another line, value or file', () => {
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', raw: '13px', line: 14 }])
    ).toBe(false);
    expect(
      isAccepted(finding, [{ file: 'app/x.tsx', raw: '12px', line: 10 }])
    ).toBe(false);
    expect(
      isAccepted(finding, [{ file: 'app/y.tsx', raw: '13px', line: 10 }])
    ).toBe(false);
  });
});
