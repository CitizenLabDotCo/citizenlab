import { FormatMessage } from 'typings';
import referrerTypeMessages from '../../hooks/useVisitorReferrerTypes/messages';
import { getTranslations as getReferrerTranslations } from '../../hooks/useVisitorReferrers/translations';
import { ReferrerListResponse } from '../../hooks/useVisitorReferrers/typings';
// services
import { apiEndpoint, QuerySchema, Query } from '../../services/analyticsFacts';
// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';
import { reportError } from 'utils/loggingUtils';
import { roundPercentages } from 'utils/math';
import request from 'utils/request';
import { sanitizeQueryParameters } from 'utils/streams/utils';
import { XlsxData } from 'components/admin/ReportExportMenu';
// typings
import { ProjectId, Dates } from '../../typings';
// i18n
import messages from './messages';

type QueryParameters = ProjectId & Dates;

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const query: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_last_action',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: ['dimension_referrer_type.name', 'referrer_name'],
    aggregations: {
      all: 'count',
      visitor_id: 'count',
    },
  };

  return { query };
};

export default async function getXlsxData(
  parameters: QueryParameters,
  referrerTypesXlsxData: XlsxData,
  formatMessage: FormatMessage
): Promise<XlsxData> {
  try {
    const referrersResponse = await request<ReferrerListResponse>(
      apiEndpoint,
      null,
      { method: 'GET' },
      sanitizeQueryParameters(query(parameters))
    );

    return {
      ...referrerTypesXlsxData,
      ...parseReferrers(referrersResponse, formatMessage),
    };
  } catch (error) {
    reportError(error);
    return referrerTypesXlsxData;
  }
}

const parseReferrers = (
  { data }: ReferrerListResponse,
  formatMessage: FormatMessage
): XlsxData => {
  if (data.length === 0) return {};

  const trafficSource = formatMessage(referrerTypeMessages.trafficSource);
  const referrer = formatMessage(messages.referrer);
  const numberOfVisits = formatMessage(referrerTypeMessages.numberOfVisits);
  const percentageOfVisits = formatMessage(
    referrerTypeMessages.percentageOfVisits
  );
  const numberOfVisitors = formatMessage(messages.numberOfVisitors);
  const percentageOfVisitors = formatMessage(messages.percentageOfVisitors);
  const referrerTranslations = getReferrerTranslations(formatMessage);

  const visitPercentages = roundPercentages(data.map(({ count }) => count));
  const visitorPercentages = roundPercentages(
    data.map(({ count_visitor_id }) => count_visitor_id)
  );

  const parsedData = data.map((row, i) => ({
    [trafficSource]:
      row['dimension_referrer_type.name'] in referrerTranslations
        ? referrerTranslations[row['dimension_referrer_type.name']]
        : row['dimension_referrer_type.name'],
    [referrer]: row.referrer_name ?? '',
    [numberOfVisits]: row.count,
    [numberOfVisitors]: row.count_visitor_id,
    [percentageOfVisits]: visitPercentages[i],
    [percentageOfVisitors]: visitorPercentages[i],
  }));

  return {
    [formatMessage(messages.referrers)]: parsedData,
  };
};
