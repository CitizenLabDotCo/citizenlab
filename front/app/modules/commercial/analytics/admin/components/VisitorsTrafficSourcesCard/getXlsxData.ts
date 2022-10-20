import request from 'utils/request';

// services
import { apiEndpoint } from '../../services/analyticsFacts';

// i18n
import messages from './messages';
import reffererTypeMessages from '../../hooks/useVisitorReferrerTypes/messages';
import { getTranslations as getReferrerTranslations } from '../../hooks/useVisitorReferrers/utils';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';
import { reportError } from 'utils/loggingUtils';
import { sanitizeQueryParameters } from 'utils/streams/utils';

// typings
import {
  QueryParametersWithoutPagination,
  ReferrerListResponse,
} from '../../hooks/useVisitorReferrers/typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { QuerySchema, Query } from '../../services/analyticsFacts';
import { WrappedComponentProps } from 'react-intl';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParametersWithoutPagination): Query => {
  const query: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
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
  parameters: QueryParametersWithoutPagination,
  referrerTypesXlsxData: XlsxData,
  formatMessage: WrappedComponentProps['intl']['formatMessage']
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
  formatMessage: WrappedComponentProps['intl']['formatMessage']
): XlsxData => {
  const trafficSource = formatMessage(reffererTypeMessages.trafficSource);
  const referrer = formatMessage(messages.referrer);
  const numberOfVisits = formatMessage(reffererTypeMessages.numberOfVisits);
  const numberOfVisitors = formatMessage(messages.numberOfVisitors);
  const referrerTranslations = getReferrerTranslations(formatMessage);

  const parsedData = data.map((row) => ({
    [trafficSource]:
      row['dimension_referrer_type.name'] in referrerTranslations
        ? referrerTranslations[row['dimension_referrer_type.name']]
        : row['dimension_referrer_type.name'],
    [referrer]: row.referrer_name ?? '',
    [numberOfVisits]: row.count,
    [numberOfVisitors]: row.count_visitor_id,
  }));

  return {
    [formatMessage(messages.referrers)]: parsedData,
  };
};
