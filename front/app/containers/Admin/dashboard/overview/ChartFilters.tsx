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
  currentProjectFilter: string | undefined;
  resolution: IResolution;
  onChangeTimeRange: (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => void;
  onProjectFilter: (filter: IOption) => void;
  onChangeResolution: (resolution: IResolution) => void;
}

const ChartFilters = ({
  startAtMoment,
  endAtMoment,
  currentProjectFilter,
  resolution,
  onChangeTimeRange,
  onProjectFilter,
  onChangeResolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const smallerThanSmallDesktop = useBreakpoint('smallDesktop');

  return (
    <Box
      width="100%"
      display="flex"
      mt="-10px"
      mb="20px"
      justifyContent="space-between"
      flexDirection={smallerThanSmallDesktop ? 'column' : 'row'}
    >
      <Box display="flex" mb={smallerThanSmallDesktop ? '12px' : undefined}>
        <TimeControl
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          onChange={onChangeTimeRange}
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
