import messages from './messages';

// Utils
import { getTimePeriodMoment } from '../../utils/resolution';
import { formatCountValue } from '../../utils/parse';
import { getDateFilter, getProjectFilter } from '../../utils/query';
import { underscoreCase } from '../../hooks/useStatCard/parse';

// Typings
import {
  StatCardData,
  StatCardProps,
  StatCardConfig,
} from '../../hooks/useStatCard/typings';
import { Query, QuerySchema } from '../../services/analyticsFacts';
import moment, { Moment } from 'moment';

// Type helps to keep this file and tests type safe although useStatCard returns a more generic object
export interface ProposalsCardLabels {
  proposals: string;
  periodLabel: string;
  totalProposals: string;
  successfulProposals: string;
  successfulProposalsToolTip: string;
}

export const proposalsConfig: StatCardConfig = {
  // Pass in the messages object
  messages,

  // Card title
  title: messages.proposals,

  // Create the data object
  dataParser: (responseData, labels: ProposalsCardLabels): StatCardData => {
    const [total, totalPeriod, successful, successfulPeriod] = responseData;
    return {
      cardTitle: labels.proposals,
      fileName: underscoreCase(labels.proposals),
      periodLabel: labels.periodLabel,
      stats: [
        {
          label: labels.totalProposals,
          value: formatCountValue(total[0].count),
          lastPeriod: formatCountValue(totalPeriod[0].count),
        },
        {
          label: labels.successfulProposals,
          value: formatCountValue(successful[0].count),
          lastPeriod: formatCountValue(successfulPeriod[0].count),
          toolTip: labels.successfulProposalsToolTip,
        },
      ],
    };
  },

  // Analytics API query
  queryHandler: ({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  }: StatCardProps): Query => {
    const todayMoment = moment();
    const lastPeriodMoment = getTimePeriodMoment(resolution);

    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      successful = false
    ): QuerySchema => {
      const successStatus = () => {
        return successful
          ? { 'dimension_status.code': 'threshold_reached' }
          : {};
      };
      return {
        fact: 'post',
        aggregations: {
          all: 'count',
        },
        filters: {
          'dimension_type.name': 'initiative',
          ...successStatus,
          ...getProjectFilter('dimension_project', projectId),
          ...getDateFilter('dimension_date_created', startMoment, endMoment),
        },
      };
    };

    const queryAll: QuerySchema = queryBase(startAtMoment, endAtMoment);
    const queryAllLastPeriod: QuerySchema = queryBase(
      lastPeriodMoment,
      todayMoment
    );
    const querySuccessful: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      true
    );
    const querySuccessfulLastPeriod: QuerySchema = queryBase(
      lastPeriodMoment,
      todayMoment,
      true
    );

    return {
      query: [
        queryAll,
        queryAllLastPeriod,
        querySuccessful,
        querySuccessfulLastPeriod,
      ],
    };
  },
};
