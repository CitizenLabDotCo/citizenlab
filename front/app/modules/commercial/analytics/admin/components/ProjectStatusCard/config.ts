import messages from './messages';

// Utils
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
export interface ProjectStatusCardLabels {
  projects: string;
  periodLabel: string;
  totalProjects: string;
  totalProjectsToolTip: string;
  active: string;
  activeToolTip: string;
  archived: string;
  finished: string;
  finishedToolTip: string;
  draftProjects: string;
}

export const projectStatusConfig: StatCardConfig = {
  // Pass in the messages object
  messages,

  // Card title
  title: messages.projects,

  // Create the data object
  dataParser: (responseData, labels: ProjectStatusCardLabels): StatCardData => {
    // Upcoming is not available if 3 stat arrays are not returned
    let total;
    let active;
    let archived;
    let finished;
    let draft;
    if (responseData.length === 5) {
      [total, active, archived, finished, draft] = responseData;
    } else {
      [archived, finished, draft] = responseData;
    }

    const cardData: StatCardData = {
      cardTitle: labels.projects,
      fileName: underscoreCase(labels.projects),
      stats: [],
    };
    if (total) {
      cardData.stats.push({
        label: labels.totalProjects,
        value: formatCountValue(total[0].count),
        toolTip: labels.totalProjectsToolTip,
      });
      cardData.stats.push({
        label: labels.active,
        value: formatCountValue(active[0].count),
        toolTip: labels.activeToolTip,
      });
    }
    cardData.stats.push({
      label: labels.archived,
      value: formatCountValue(archived[0].count),
    });
    cardData.stats.push({
      label: labels.finished,
      value: formatCountValue(finished[0].count),
      toolTip: labels.finishedToolTip,
    });
    console.log(draft); // Need to handle draft this differently

    return cardData;
  },

  // Analytics API query
  queryHandler: ({
    projectId,
    startAtMoment,
    endAtMoment,
  }: StatCardProps): Query => {
    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      dateType: 'start' | 'end' | 'created'
    ): QuerySchema => {
      const querySchema: QuerySchema = {
        fact: 'event',
        aggregations: {
          all: 'count',
        },
      };

      const filters = {
        ...getDateFilter(`dimension_date_${dateType}`, startMoment, endMoment),
        ...getProjectFilter('dimension_project', projectId),
      };
      if (Object.keys(filters).length !== 0) {
        querySchema.filters = filters;
      }

      return querySchema;
    };

    const queryTotal: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'created'
    );

    const todayMoment = moment();
    const wayPastMoment = moment().set('year', 2010);
    const wayForwardMoment = moment().set('year', 2030);

    const queryActive: QuerySchema = queryBase(
      todayMoment,
      wayForwardMoment,
      'start'
    );
    const queryArchived: QuerySchema = queryBase(
      startAtMoment ? startAtMoment : wayPastMoment,
      endAtMoment ? endAtMoment : todayMoment,
      'end'
    );
    const queryFinished: QuerySchema = queryBase(
      startAtMoment ? startAtMoment : wayPastMoment,
      endAtMoment ? endAtMoment : todayMoment,
      'end'
    );
    const queryDraft: QuerySchema = queryBase(
      startAtMoment ? startAtMoment : wayPastMoment,
      endAtMoment ? endAtMoment : todayMoment,
      'end'
    );

    // Remove the total and active queries if there are start and end date filters
    let returnQuery = [
      queryTotal,
      queryActive,
      queryArchived,
      queryFinished,
      queryDraft,
    ];
    if (startAtMoment && endAtMoment) {
      returnQuery = [queryArchived, queryFinished, queryDraft];
    }
    return {
      query: returnQuery,
    };
  },
};
