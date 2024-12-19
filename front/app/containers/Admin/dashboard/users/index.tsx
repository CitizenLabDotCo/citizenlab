import React, { PureComponent } from 'react';

import moment, { Moment } from 'moment';

import { GraphsContainer } from 'components/admin/GraphWrappers';

import { trackEventByName } from 'utils/analytics';

import tracks from '../tracks';

import ChartFilters from './ChartFilters';
import Charts from './Charts';

interface State {
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
}

interface Props {}

export class UsersDashboard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
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
    trackEventByName(tracks.filteredOnGroup.name, { group: filter });
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
        <ChartFilters
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          currentGroupFilter={currentGroupFilter}
          onChangeTimeRange={this.handleChangeTimeRange}
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

export default UsersDashboard;
