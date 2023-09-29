// services
import { QuerySchema, Query } from 'api/analytics/types';

// i18n
import messages from './messages';
import referrerTypeMessages from './useVisitorReferrerTypes/messages';
import { getTranslations as getReferrerTranslations } from './useVisitorReferrers/translations';

// utils
import { getProjectFilter, getDateFilter } from '../_utils/query';
import { reportError } from 'utils/loggingUtils';

import { roundPercentages } from 'utils/math';

// typings
import { ProjectId, Dates } from '../typings';
import { ReferrerListResponse } from './useVisitorReferrers/typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { FormatMessage } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  cloneDeep,
  forOwn,
  isUndefined,
  isEmpty,
  isObject,
  isString,
  isArray,
} from 'lodash-es';

type QueryParameters = ProjectId & Dates;

export const sanitizeQueryParameters = (
  queryParameters: Record<string, any> | null,
  skipSanitizationFor?: string[]
) => {
  const sanitizedQueryParameters = cloneDeep(queryParameters);

  forOwn(queryParameters, (value, key) => {
    if (
      !skipSanitizationFor?.includes(key) &&
      (isUndefined(value) ||
        (isString(value) && isEmpty(value)) ||
        (isArray(value) && isEmpty(value)) ||
        (isObject(value) && isEmpty(value)))
    ) {
      delete (sanitizedQueryParameters as Record<string, any>)[key];
    }
  });

  return isObject(sanitizedQueryParameters) &&
    !isEmpty(sanitizedQueryParameters)
    ? sanitizedQueryParameters
    : null;
};

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
        'dimension_date_first_action',
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
    const referrersResponse = await fetcher<ReferrerListResponse>({
      path: '/analytics',
      action: 'get',
      queryParams: sanitizeQueryParameters(query(parameters)) ?? undefined,
    });

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
  if (data.attributes.length === 0) return {};

  const trafficSource = formatMessage(referrerTypeMessages.trafficSource);
  const referrer = formatMessage(messages.referrer);
  const numberOfVisits = formatMessage(referrerTypeMessages.numberOfVisits);
  const percentageOfVisits = formatMessage(
    referrerTypeMessages.percentageOfVisits
  );
  const numberOfVisitors = formatMessage(messages.numberOfVisitors);
  const percentageOfVisitors = formatMessage(messages.percentageOfVisitors);
  const referrerTranslations = getReferrerTranslations(formatMessage);

  const visitPercentages = roundPercentages(
    data.attributes.map(({ count }) => count)
  );
  const visitorPercentages = roundPercentages(
    data.attributes.map(({ count_visitor_id }) => count_visitor_id)
  );

  const parsedData = data.attributes.map((row, i) => ({
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
