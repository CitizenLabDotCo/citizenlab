import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { ControlBar } from 'components/admin/GraphWrappers';
import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';
import ProjectFilter from '../components/filters/ProjectFilter';
import TimeControl from '../components/TimeControl';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

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

const ChartFilters = injectIntl(
  ({
    startAtMoment,
    endAtMoment,
    currentProjectFilter,
    resolution,
    onChangeTimeRange,
    onProjectFilter,
    onChangeResolution,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => (
    <ControlBar>
      <Box display="flex" flexDirection="row">
        <TimeControl
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          onChange={onChangeTimeRange}
        />
        <Box ml="16px" mr="16px" maxWidth="320px">
          <ProjectFilter
            currentProjectFilter={currentProjectFilter}
            hideLabel
            placeholder={formatMessage(messages.selectProject)}
            width="100%"
            padding="11px"
            onProjectFilter={onProjectFilter}
          />
        </Box>
      </Box>
      <ResolutionControl value={resolution} onChange={onChangeResolution} />
    </ControlBar>
  )
);

export default ChartFilters;
