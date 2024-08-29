import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Moment } from 'moment';
import { IOption } from 'typings';

import { useIntl } from 'utils/cl-intl';

import GroupFilter from '../components/filters/GroupFilter';
import TimeControl from '../components/TimeControl';
import messages from '../messages';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  currentGroupFilter?: string;
  onChangeTimeRange: (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => void;
  onGroupFilter: (filter: IOption) => void;
}

const ChartFilters = ({
  startAtMoment,
  endAtMoment,
  currentGroupFilter,
  onGroupFilter,
  onChangeTimeRange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box width="100%" display="flex" mt="-10px">
      <TimeControl
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        onChange={onChangeTimeRange}
      />
      <Box ml="12px">
        <GroupFilter
          currentGroupFilter={currentGroupFilter}
          placeholder={formatMessage(messages.labelGroupFilter)}
          onGroupFilter={onGroupFilter}
        />
      </Box>
    </Box>
  );
};

export default ChartFilters;
