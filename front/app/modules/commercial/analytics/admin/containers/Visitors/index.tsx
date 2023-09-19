import React, { useState, useEffect } from 'react';
import moment, { Moment } from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAnalytics from 'api/analytics/useAnalytics';
import { useIntl } from 'utils/cl-intl';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import ChartFilters from 'containers/Admin/dashboard/overview/ChartFilters';
import Charts from './Charts';
import Warning from 'components/UI/Warning';

// utils
import { getSensibleResolution } from 'containers/Admin/dashboard/overview/getSensibleResolution';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { IOption } from 'typings';
import { Query, QuerySchema } from 'api/analytics/types';
import { Response } from '../../components/VisitorsLanguageCard/useVisitorLanguages/typings';

import messages from './messages';

const query = (): Query => {
  const localesCountQuery: QuerySchema = {
    fact: 'visit',
    aggregations: {
      all: 'count',
      'dimension_date_first_action.date': 'first',
    },
  };

  return {
    query: localesCountQuery,
  };
};

const Visitors = () => {
  const [startAtMoment, setStartAtMoment] = useState<Moment | null | undefined>(
    undefined
  );
  const [endAtMoment, setEndAtMoment] = useState<Moment | null>(moment());
  const [projectId, setProjectId] = useState<string | undefined>();
  const [resolution, setResolution] = useState<IResolution>('month');
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const { data: analytics } = useAnalytics<Response>(query());

  useEffect(() => {
    const createdAt = appConfig && moment(appConfig.data.attributes.created_at);
    if (createdAt && analytics && analytics.data.attributes.length > 0) {
      const [countData] = analytics.data.attributes;
      if (!countData) return;

      const uniqueVisitorDataDate = moment(
        countData.first_dimension_date_first_action_date
      );

      setStartAtMoment(uniqueVisitorDataDate);
    }
  }, [analytics, appConfig]);

  const handleChangeTimeRange = (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => {
    const resolution = getSensibleResolution(startAtMoment, endAtMoment);
    setStartAtMoment(startAtMoment);
    setEndAtMoment(endAtMoment);
    setResolution(resolution);
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProjectId(value);
  };

  if (!appConfig || !analytics || analytics?.data.attributes.length === 0) {
    return null;
  }

  const [countData] = analytics.data.attributes;

  return (
    <>
      <Box width="100%">
        <ChartFilters
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          currentProjectFilter={projectId}
          resolution={resolution}
          onChangeTimeRange={handleChangeTimeRange}
          onProjectFilter={handleProjectFilter}
          onChangeResolution={setResolution}
          showAllTime={false}
          minDate={moment(countData.first_dimension_date_first_action_date)}
        />
      </Box>
      <Box p="10px">
        <Warning
          text={
            <Text color="primary" m="0px" fontSize="s">
              {formatMessage(messages.dateInfo, {
                date: moment(
                  countData.first_dimension_date_first_action_date
                ).format('LL'),
              })}
            </Text>
          }
        />
      </Box>

      <Charts
        projectId={projectId}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
      />
    </>
  );
};

const FeatureFlagWrapper = () => {
  const visitorsDashboardEnabled = useFeatureFlag({
    name: 'visitors_dashboard',
  });

  if (!visitorsDashboardEnabled) return null;

  return <Visitors />;
};

export default FeatureFlagWrapper;
