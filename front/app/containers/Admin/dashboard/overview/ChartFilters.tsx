import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Moment } from 'moment';
import { IOption } from 'typings';

import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../components/filters/ProjectFilter';
import TimeControl from '../components/TimeControl';
import messages from '../messages';

interface Props {
  startAtMoment?: Moment | null | undefined;
  endAtMoment: Moment | null;
  minDate?: Moment;
  projectId: string | undefined;
  resolution: IResolution;
  timeControlTooltip?: string;
  onChangeTimeRange: (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => void;
  onProjectFilter: (filter: IOption) => void;
  onChangeResolution: (resolution: IResolution) => void;
  showAllTime?: boolean;
  showProjectFilter?: boolean;
}

const ChartFilters = ({
  startAtMoment,
  endAtMoment,
  minDate,
  projectId,
  resolution,
  timeControlTooltip,
  onChangeTimeRange,
  onProjectFilter,
  onChangeResolution,
  showAllTime,
  showProjectFilter = true,
}: Props) => {
  const { formatMessage } = useIntl();
  const isSmallerThanSmallDesktop = useBreakpoint('smallDesktop');

  return (
    <Box
      width="100%"
      display="flex"
      mt="-10px"
      mb="20px"
      justifyContent="space-between"
      flexDirection={isSmallerThanSmallDesktop ? 'column' : 'row'}
    >
      <Box display="flex" mb={isSmallerThanSmallDesktop ? '12px' : undefined}>
        <TimeControl
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          onChange={onChangeTimeRange}
          showAllTime={showAllTime}
          minDate={minDate}
          tooltip={timeControlTooltip}
        />
        {showProjectFilter && (
          <Box ml="12px" maxWidth="350px">
            <ProjectFilter
              projectId={projectId}
              hideLabel
              placeholder={formatMessage(messages.selectProject)}
              onProjectFilter={onProjectFilter}
            />
          </Box>
        )}
      </Box>
      <ResolutionControl value={resolution} onChange={onChangeResolution} />
    </Box>
  );
};

export default ChartFilters;
