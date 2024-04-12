import { XlsxData } from 'components/admin/ReportExportMenu';

import { parseExcelData } from './parse';
import { StatCardData } from './typings';

describe('Stat card Excel parsing', () => {
  it('Transforms data correctly into XLS data', () => {
    const statCardData: StatCardData = {
      cardTitle: 'Card Title',
      fileName: 'card_title',
      periodLabel: '30 Days',
      stats: [
        { value: '2', label: 'Total', lastPeriod: '1' },
        { value: '-', label: 'Successful stat' },
      ],
    };

    const expectedXlsData: XlsxData = {
      'Card Title': [
        {
          total: '2',
          total_30_days: '1',
          successful_stat: '-',
        },
      ],
    };

    expect(parseExcelData(statCardData)).toEqual(expectedXlsData);
  });
});
