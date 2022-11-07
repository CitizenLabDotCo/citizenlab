import { parseInvitationsChartData, parseInvitationsExcelData } from './parse';
import { InvitationsChartData } from './typings';
import { InvitationsLabels } from './utils';
import { XlsxData } from 'components/admin/ReportExportMenu';

describe('Analytics proposals response parsing', () => {
  const responseData = [
    [{ count: 4 }],
    [{ count: 3 }],
    [{ count: 2 }],
    [{ count: 0 }],
  ];
  const [all, allPeriod, successful, successfulPeriod] = responseData;

  it('Transforms into correct chart data', () => {
    const expectedChartData: InvitationsChartData = {
      totalInvites: {
        value: '4',
        lastPeriod: '3',
      },
      pendingInvites: {
        value: '2',
        lastPeriod: '-',
      },
    };

    const chartData = parseInvitationsChartData(
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
          Successful_30days: '-',
        },
      ],
    };

    const labels: InvitationsLabels = {
      cardTitle: 'CardTitle',
      fileName: 'cardtitle',
      total: 'Total',
      successful: 'Successful',
      successfulToolTip: 'Tooltip',
      period: '30days',
    };
    const xlsData = parseInvitationsExcelData(
      all,
      allPeriod,
      successful,
      successfulPeriod,
      labels
    );
    expect(xlsData).toEqual(expectedXlsData);
  });
});
