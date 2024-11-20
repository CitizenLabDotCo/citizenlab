import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import moment, { Moment } from 'moment';
import { IOption, Multiloc } from 'typings';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';
import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../../_shared/ProjectFilter';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

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

interface DateRangeProps {
  resetComparePeriod?: boolean;
  label?: string;
}

export const DateRangeInput = ({
  resetComparePeriod = false,
  label,
}: DateRangeProps) => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    startAtMoment,
    endAtMoment,
    compareStartAt,
    compareEndAt,
  } = useNode((node) => ({
    startAtMoment: node.data.props.startAt
      ? moment(node.data.props.startAt)
      : null,
    endAtMoment: node.data.props.endAt ? moment(node.data.props.endAt) : null,
    compareStartAt: node.data.props.compareStartAt,
    compareEndAt: node.data.props.compareEndAt,
  }));

  const comparePreviousPeriod = !!compareStartAt && !!compareEndAt;

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

    if (resetComparePeriod) {
      if (startDate && endDate) {
        if (comparePreviousPeriod) {
          const { compare_start_at, compare_end_at } = getComparedTimeRange(
            startDate,
            endDate
          );

          setProp((props) => {
            props.compareStartAt = compare_start_at;
            props.compareEndAt = compare_end_at;
          });
        }
      } else {
        // Make sure that we always reset compared date range
        // if the main date range is not fully set
        setProp((props) => {
          props.compareStartAt = undefined;
          props.compareEndAt = undefined;
        });
      }
    }
  };

  return (
    <Box mb="20px">
      <Text variant="bodyM" color="textSecondary" mb="5px">
        {label ?? formatMessage(messages.analyticsChartDateRange)}
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
