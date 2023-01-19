import React from 'react';

// components
import { Box, Input, Text, Icon } from '@citizenlab/cl2-component-library';
import DateRangePicker from 'components/admin/DateRangePicker';
import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';

// hooks
import { useIntl } from 'utils/cl-intl';
import { useNode } from '@craftjs/core';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import moment, { Moment } from 'moment';

// messages
import messages from '../messages';
import ActiveUsersMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';

// typings
import { IOption } from 'typings';

export const ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    projectId,
    startAtMoment,
    endAtMoment,
  } = useNode((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    startAtMoment: node.data.props.startAt
      ? moment(node.data.props.startAt)
      : null,
    endAtMoment: node.data.props.endAt ? moment(node.data.props.endAt) : null,
  }));

  const setTitle = (value: string) => {
    setProp((props) => {
      props.title = value;
    });
  };

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setProp((props) => {
      props.startAt = startDate?.format('YYYY-MM-DDTHH:mm:ss.sss');
      props.endAt = endDate?.format('YYYY-MM-DDTHH:mm:ss.sss');
    });
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProp((props) => {
      props.projectId = value;
    });
  };

  return (
    <Box>
      <Box
        bgColor={colors.teal100}
        borderRadius={stylingConsts.borderRadius}
        px="12px"
        py="4px"
        mt="0px"
        mb="16px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="bodyS" color="textSecondary">
          <Icon
            name="info-outline"
            width="16px"
            height="16px"
            mr="4px"
            fill="textSecondary"
            display="inline"
          />
          {formatMessage(ActiveUsersMessages.cardTitleTooltipMessage)}
        </Text>
      </Box>
      <Box background="#ffffff" marginBottom="20px">
        <Input
          id="e2e-analytics-chart-widget-title"
          label={
            <Text variant="bodyM" color="textSecondary" mb="0">
              {formatMessage(messages.analyticsChartTitle)}
            </Text>
          }
          type="text"
          value={title}
          onChange={setTitle}
        />
      </Box>
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.analyticsChartDateRange)}
        </Text>
        <DateRangePicker
          startDateId={'startAt'}
          endDateId={'endAt'}
          startDate={startAtMoment}
          endDate={endAtMoment}
          onDatesChange={handleChangeTimeRange}
        />
      </Box>
      <Box mb="20px">
        <ProjectFilter
          currentProjectFilter={projectId}
          width="100%"
          padding="11px"
          onProjectFilter={handleProjectFilter}
        />
      </Box>
    </Box>
  );
};
