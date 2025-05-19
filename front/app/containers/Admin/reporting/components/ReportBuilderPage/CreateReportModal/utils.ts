import { RouteType } from 'routes';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

import { toBackendDateString } from 'utils/dateUtils';

import { Template } from './typings';

interface Params {
  reportId: string;
  selectedProjectId: string | undefined;
  template: Template;
  dates: Partial<DateRange>;
  year: number | null;
  quarter: number | null;
}

export const getRedirectUrl = ({
  reportId,
  selectedProjectId,
  template,
  dates: { from, to },
  year,
  quarter,
}: Params) => {
  const reportBuilderRoute = '/admin/reporting/report-builder';
  const reportRoute = `${reportBuilderRoute}/${reportId}/editor`;

  let params = '';

  if (template === 'project' && selectedProjectId) {
    params = `?templateProjectId=${selectedProjectId}`;
  }

  if (template === 'community-monitor' && year && quarter) {
    params = `?year=${year}&quarter=${quarter}`;
  }

  if (template === 'platform' && from && to) {
    const startDateFormat = toBackendDateString(from);
    const endDateFormat = toBackendDateString(to);

    const startDateParam = `startDatePlatformReport=${startDateFormat}`;
    const endDateParam = `endDatePlatformReport=${endDateFormat}`;

    params = `?${startDateParam}&${endDateParam}`;
  }

  return `${reportRoute}${params}` as RouteType;
};
