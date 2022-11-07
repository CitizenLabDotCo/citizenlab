import { XlsxData } from 'components/admin/ReportExportMenu';
import { Stat } from '../../typings';

export interface ProposalsChartData {
  totalProposals: Stat;
  successfulProposals: Stat;
}

export interface Proposals {
  chartData: ProposalsChartData;
  xlsxData: XlsxData;
}
