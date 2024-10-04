import { format } from 'date-fns';
import { RouteType } from 'routes';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

import { Template } from './typings';

interface Params {
  reportId: string;
  selectedProjectId: string | undefined;
  template: Template;
  dates: Partial<DateRange>;
}

export const getRedirectUrl = ({
  reportId,
  selectedProjectId,
  template,
  dates: { from, to },
}: Params) => {
  const reportBuilderRoute = '/admin/reporting/report-builder';
  const reportRoute = `${reportBuilderRoute}/${reportId}/editor`;

  let params = '';

  if (template === 'project' && selectedProjectId) {
    params = `?templateProjectId=${selectedProjectId}`;
  }

  if (template === 'platform' && from && to) {
    const startDateFormat = format(from, 'yyyy-MM-dd');
    const endDateFormat = format(to, 'yyyy-MM-dd');

    const startDateParam = `startDatePlatformReport=${startDateFormat}`;
    const endDateParam = `endDatePlatformReport=${endDateFormat}`;

    params = `?${startDateParam}&${endDateParam}`;
  }

  return `${reportRoute}${params}` as RouteType;
};
