// libraries
import React, { PureComponent } from 'react';
import moment, { Moment } from 'moment';

// components
import ChartFilters from './ChartFilters';
import { GraphsContainer, ControlBar } from 'components/admin/GraphWrappers';
import TimeControl from '../components/TimeControl';
import Charts from './Charts';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

interface State {
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
}

interface Props {}

interface Tracks {
  trackFilterOnGroup: (args: { extra: Record<string, string> }) => void;
}

export class UsersDashboard extends PureComponent<Props & Tracks, State> {
  constructor(props: Props & Tracks) {
    super(props as any);
    this.state = {
      startAtMoment: undefined,
      endAtMoment: moment(),
      currentGroupFilter: undefined,
      currentGroupFilterLabel: undefined,
    };
  }

  handleChangeTimeRange = (
    startAtMoment: Moment | null | undefined,
    endAtMoment: Moment | null
  ) => {
    this.setState({ startAtMoment, endAtMoment });
  };

  handleOnGroupFilter = (filter) => {
    this.props.trackFilterOnGroup({ extra: { group: filter } });
    this.setState({
      currentGroupFilter: filter.value,
      currentGroupFilterLabel: filter.label,
    });
  };

  render() {
    const {
      currentGroupFilter,
      endAtMoment,
      startAtMoment,
      currentGroupFilterLabel,
    } = this.state;
    const startAt = startAtMoment && startAtMoment.toISOString();
    const endAt = endAtMoment && endAtMoment.toISOString();

    return (
      <>
        <ControlBar>
          <TimeControl
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            onChange={this.handleChangeTimeRange}
          />
        </ControlBar>

        <ChartFilters
          currentGroupFilter={currentGroupFilter}
          onGroupFilter={this.handleOnGroupFilter}
        />

        <GraphsContainer>
          <Charts
            startAt={startAt}
            endAt={endAt}
            currentGroupFilter={currentGroupFilter}
            currentGroupFilterLabel={currentGroupFilterLabel}
          />
        </GraphsContainer>
      </>
    );
  }
}

const UsersDashBoardWithHOCs = injectTracks<Props>({
  trackFilterOnGroup: tracks.filteredOnGroup,
})(UsersDashboard);

export default UsersDashBoardWithHOCs;
