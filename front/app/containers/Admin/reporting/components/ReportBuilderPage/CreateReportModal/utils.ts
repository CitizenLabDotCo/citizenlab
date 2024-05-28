import { RouteType } from 'routes';

import { Dates } from 'components/admin/DateRangePicker';

import { Template } from './typings';

interface Params {
  reportId: string;
  selectedProjectId: string | undefined;
  template: Template;
  dates: Dates;
}

export const getRedirectUrl = ({
  reportId,
  selectedProjectId,
  template,
  dates: { startDate, endDate },
}: Params) => {
  const reportBuilderRoute = '/admin/reporting/report-builder';
  const reportRoute = `${reportBuilderRoute}/${reportId}/editor`;

  let params = '';

  if (template === 'project' && selectedProjectId) {
    params = `?templateProjectId=${selectedProjectId}`;
  }

  if (template === 'strategic' && startDate && endDate) {
    params = `?startDateStrategicReport=${startDate}&endDateStrategicReport=${endDate}`;
  }

  return `${reportRoute}${params}` as RouteType;
};
