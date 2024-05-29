import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import moment, { Moment } from 'moment';
import { IOption, Multiloc } from 'typings';

import DateRangePicker from 'components/admin/DateRangePicker';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../../_shared/ProjectFilter';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import { Props } from './typings';

const ChartWidgetSettings = () => {
  return (
    <Box>
      <TitleInput />
      <DateRangeInput />
      <ProjectInput />
    </Box>
  );
};

export const TitleInput = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    title,
  } = useNode((node) => ({
    title: node.data.props.title,
  }));

  const setTitle = (value: Multiloc) => {
    setProp((props: ChartWidgetProps) => {
      props.title = value;
    });
  };

  return (
    <Box marginBottom="20px">
      <InputMultilocWithLocaleSwitcher
        id="e2e-analytics-chart-widget-title"
        label={
          <Text variant="bodyM" color="textSecondary" mb="0">
            {formatMessage(messages.analyticsChartTitle)}
          </Text>
        }
        type="text"
        valueMultiloc={title}
        onChange={setTitle}
      />
    </Box>
  );
};

export const DateRangeInput = ({ onChangeDateRange }: Props) => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    startAtMoment,
    endAtMoment,
  } = useNode((node) => ({
    startAtMoment: node.data.props.startAt
      ? moment(node.data.props.startAt)
      : null,
    endAtMoment: node.data.props.endAt ? moment(node.data.props.endAt) : null,
  }));

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setProp((props: ChartWidgetProps) => {
      props.startAt = startDate?.format('YYYY-MM-DD');
      props.endAt = endDate?.format('YYYY-MM-DD');
    });

    onChangeDateRange?.({ startDate, endDate });
  };

  return (
    <Box mb="20px">
      <Text variant="bodyM" color="textSecondary" mb="5px">
        {formatMessage(messages.analyticsChartDateRange)}
      </Text>
      <DateRangePicker
        startDate={startAtMoment}
        endDate={endAtMoment}
        onDatesChange={handleChangeTimeRange}
      />
    </Box>
  );
};

export const ProjectInput = () => {
  const {
    actions: { setProp },
    projectId,
  } = useNode((node) => ({
    projectId: node.data.props.projectId,
  }));

  const handleProjectFilter = ({ value }: IOption) => {
    setProp((props: ChartWidgetProps) => {
      props.projectId = value;
    });
  };

  return (
    <Box mb="20px">
      <ProjectFilter
        projectId={projectId}
        onProjectFilter={handleProjectFilter}
      />
    </Box>
  );
};

export default ChartWidgetSettings;
