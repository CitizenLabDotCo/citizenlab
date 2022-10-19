import request from 'utils/request';

// services
import { apiEndpoint } from '../../services/analyticsFacts';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';
import { reportError } from 'utils/loggingUtils';

// typings
import {
  QueryParametersWithoutPagination,
  ReferrerListResponse,
} from '../../hooks/useVisitorReferrers/typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { QuerySchema, Query } from '../../services/analyticsFacts';

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

// const getTranslation = (formatMessage: )

export default async function getXlsxData(
  parameters: QueryParametersWithoutPagination,
  referrerTypesXlsxData: XlsxData
): Promise<XlsxData> {
  try {
    const referrersResponse = await request<ReferrerListResponse>(
      apiEndpoint,
      null,
      null,
      query(parameters)
    );

    console.log(referrersResponse);

    return {
      ...referrerTypesXlsxData,
      ...parseReferrers(referrersResponse),
    };
  } catch (error) {
    reportError(error);
    return referrerTypesXlsxData;
  }
}

const parseReferrers = ({ data }: ReferrerListResponse): XlsxData => {
  return data.map((row) => ({}));
};
