import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';
import ProjectFilter from '../components/filters/ProjectFilter';
import TimeControl from '../components/TimeControl';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { IOption } from 'typings';
import { Moment } from 'moment';

interface Props {
  startAtMoment?: Moment | null | undefined;
  endAtMoment: Moment | null;
  minDate?: Moment;
  currentProjectFilter: string | undefined;
  resolution: IResolution;
  onChangeTimeRange: (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => void;
  onProjectFilter: (filter: IOption) => void;
  onChangeResolution: (resolution: IResolution) => void;
  showAllTime?: boolean;
}

const ChartFilters = ({
  startAtMoment,
  endAtMoment,
  minDate,
  currentProjectFilter,
  resolution,
  onChangeTimeRange,
  onProjectFilter,
  onChangeResolution,
  showAllTime,
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
        />
        <Box ml="12px" maxWidth="350px">
          <ProjectFilter
            currentProjectFilter={currentProjectFilter}
            hideLabel
            placeholder={formatMessage(messages.selectProject)}
            padding="11px"
            onProjectFilter={onProjectFilter}
          />
        </Box>
      </Box>
      <ResolutionControl value={resolution} onChange={onChangeResolution} />
    </Box>
  );
};

export default ChartFilters;
