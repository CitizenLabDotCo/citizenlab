import { XlsxData } from 'components/admin/ReportExportMenu';
import { Stat } from '../../typings';

export interface InvitationsChartData {
  totalInvites: Stat;
  pendingInvites: { value: string };
  acceptedInvites: Stat;
}

export interface Invitations {
  chartData: InvitationsChartData;
  xlsxData: XlsxData;
}
