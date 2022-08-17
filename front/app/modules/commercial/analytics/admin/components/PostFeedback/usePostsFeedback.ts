import { useState, useEffect } from 'react';

// services
import { analyticsStream, Query } from '../../../services/analyticsFacts';

// utils
import { sum, roundPercentage } from 'utils/math';

// typings
import { InjectedIntlProps } from 'react-intl';
import { Response, PostFeedback } from './typings';

// i18n
import messages from './messages';
import DashboardMessages from 'containers/Admin/dashboard/messages';

const query = (projectId?: string): Query => {
  const groups = {
    fact: 'post',
    groups: {
      key: 'project.id',
      aggregations: {
        feedback_none: 'sum',
        feedback_official: 'sum',
        feedback_status_change: 'sum',
        feedback_time_taken: 'avg',
      },
    },
  };

  const dimensions = !projectId
    ? {}
    : { dimensions: { project: { id: projectId } } };

  const query = { query: { ...groups, ...dimensions } };

  return query as Query;
};

export default function usePostsWithFeedback(
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  projectId?: string
) {
  const [postsWithFeedback, setPostsWithFeedback] = useState<
    PostFeedback | undefined
  >(undefined);
  useEffect(() => {
    analyticsStream<Response>(query(projectId)).then((results) => {
      if (results && results.data.length > 0) {
        const {
          sum_feedback_none,
          sum_feedback_official,
          sum_feedback_status_change,
          avg_feedback_time_taken,
        } = results.data[0];

        const feedback_count = sum([
          sum_feedback_official,
          sum_feedback_status_change,
        ]);
        const total = sum([feedback_count, sum_feedback_none]);

        const feedbackPercent = feedback_count / total;
        const pieCenterValue = `${Math.round(feedbackPercent * 100)}%`;
        const pieCenterLabel = formatMessage(messages.feedbackGiven);

        const days = Math.round(avg_feedback_time_taken / 86400);

        const statusChanged = formatMessage(messages.statusChanged);
        const officialUpdate = formatMessage(messages.officialUpdate);

        const pieData = [
          { name: 'sum_feedback', value: feedback_count, color: '#40B8C5' },
          {
            name: 'sum_no_feedback',
            value: sum_feedback_none,
            color: '#E0E0E0',
          },
        ];

        const progressBarsData = [
          {
            name: statusChanged,
            label: `${statusChanged}: ${sum_feedback_status_change} (${roundPercentage(
              sum_feedback_status_change,
              total
            )}%)`,
            value: sum_feedback_status_change,
            total,
          },
          {
            name: officialUpdate,
            label: `${officialUpdate}: ${sum_feedback_official} (${roundPercentage(
              sum_feedback_official,
              total
            )}%)`,
            value: sum_feedback_official,
            total,
          },
        ];

        const xlsxDataSheet1Row1 = {};
        xlsxDataSheet1Row1[formatMessage(messages.feedbackGiven)] =
          feedback_count;
        xlsxDataSheet1Row1[formatMessage(messages.statusChanged)] =
          sum_feedback_status_change;
        xlsxDataSheet1Row1[formatMessage(messages.officialUpdate)] =
          sum_feedback_official;
        xlsxDataSheet1Row1[formatMessage(DashboardMessages.total)] = total;

        const xlsxDataSheet2Row1 = {};
        xlsxDataSheet2Row1[formatMessage(messages.averageTimeColumnName)] =
          days;

        const xlsxData = {};
        xlsxData[formatMessage(messages.postFeedback)] = [xlsxDataSheet1Row1];
        xlsxData[formatMessage(messages.responseTime)] = [xlsxDataSheet2Row1];

        setPostsWithFeedback({
          pieData,
          pieCenterValue,
          pieCenterLabel,
          days,
          progressBarsData,
          xlsxData,
        });
      }
    });
  }, [projectId, formatMessage]);

  return postsWithFeedback;
}
