import { parseChartData, parseExcelData } from './parse';
import { ChartData } from './typings';
import { Labels } from './utils';
import { XlsxData } from 'components/admin/ReportExportMenu';

describe('Analytics proposals response parsing', () => {
  const responseData = [
    [{ count: 4 }],
    [{ count: 3 }],
    [{ count: 2 }],
    [{ count: 1 }],
  ];
  const [all, allPeriod, successful, successfulPeriod] = responseData;

  it('Transforms into chart data', () => {
    const expectedChartData: ChartData = {
      totalProposals: {
        value: '4',
        lastPeriod: '3',
      },
      successfulProposals: {
        value: '2',
        lastPeriod: '1',
      },
    };

    const chartData = parseChartData(
      all,
      allPeriod,
      successful,
      successfulPeriod
    );
    expect(chartData).toEqual(expectedChartData);
  });

  it('Transforms into XLS data', () => {
    const expectedXlsData: XlsxData = {
      CardTitle: [
        {
          Total: '4',
          Total_30days: '3',
          Successful: '2',
          Successful_30days: '1',
        },
      ],
    };

    const labels: Labels = {
      cardTitle: 'CardTitle',
      total: 'Total',
      successful: 'Successful',
      successfulToolTip: 'Tooltip',
      period: '30days',
    };
    const xlsData = parseExcelData(
      all,
      allPeriod,
      successful,
      successfulPeriod,
      labels
    );
    expect(xlsData).toEqual(expectedXlsData);
  });
});
