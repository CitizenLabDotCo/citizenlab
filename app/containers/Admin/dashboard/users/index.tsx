// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';
import { adopt } from 'react-adopt';
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import { usersByGenderStream, usersByBirthyearStream } from 'services/stats';

// components
import {
  chartTheme,
  GraphsContainer,
  Row,
  GraphCard,
  GraphCardInner,
  GraphCardTitle,
  ControlBar
} from '../';
import TimeControl from '../components/TimeControl';
import IntervalControl from '../components/IntervalControl';
import PieChartByCategory from './charts/PieChartByCategory';
import BarChartByCategory from './charts/BarChartByCategory';
import ChartFilters from '../components/ChartFilters';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentGroupFilter: string | null;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

interface Props extends DataProps { }

interface Tracks {
  trackFilterOnGroup: Function;
}

class UsersDashboard extends PureComponent<Props & InjectedLocalized & Tracks, State> {
  constructor(props: Props & InjectedLocalized & Tracks) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentGroupFilter: null
    };
  }

  changeInterval = (interval: 'weeks' | 'months' | 'years') => {
    this.setState({ interval, intervalIndex: 0 });
  }

  changeIntervalIndex = (intervalIndex: number) => {
    this.setState({ intervalIndex });
  }

  handleOnGroupFilter = (filter) => {
    this.props.trackFilterOnGroup({ extra: { group: filter } });
    this.setState({ currentGroupFilter: filter.value });
  }

  generateGroupFilterOptions = () => {
    const {
      groups,
      groups: { groupsList },
      localize } = this.props;

    let filterOptions: IOption[] = [];

    if (!isNilOrError(groups) && !isNilOrError(groupsList)) {
      filterOptions = groupsList.map((group) => (
        {
          value: group.id,
          label: localize(group.attributes.title_multiloc)
        }
      ));
    }

    filterOptions = [{ value: '', label: 'All' }, ...filterOptions];
    return filterOptions;
  }

  render() {
    const { interval, intervalIndex, currentGroupFilter } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();

    return (
      <>
        <ControlBar>
          <TimeControl
            value={intervalIndex}
            interval={interval}
            onChange={this.changeIntervalIndex}
            currentTime={startAtMoment}
          />
          <IntervalControl
            value={interval}
            onChange={this.changeInterval}
          />
        </ControlBar>

        <ChartFilters
          configuration={{
            showProjectFilter: false,
            showGroupFilter: true,
            showTopicFilter: false
          }}
          filters={{
            currentGroupFilter,
            currentProjectFilter: null,
            currentTopicFilter: null
          }}
          filterOptions={{
            projectFilterOptions: null,
            groupFilterOptions: this.generateGroupFilterOptions(),
            topicFilterOptions: null,
          }}
          onFilter={{
            onProjectFilter: null,
            onGroupFilter: this.handleOnGroupFilter,
            onTopicFilter: null,
          }}
        />

        <ThemeProvider theme={chartTheme}>
          <GraphsContainer>
            <Row>
              <PieChartByCategory
                className="first halfWidth"
                graphUnit="Users"
                graphTitleMessageKey="usersByGenderTitle"
                stream={usersByGenderStream}
                startAt={startAt}
                endAt={endAt}
                currentGroupFilter={currentGroupFilter}
              />
              <BarChartByCategory
                className="halfWidth"
                graphTitleMessageKey="usersByAgeTitle"
                graphUnit="Users"
                stream={usersByBirthyearStream}
                startAt={startAt}
                endAt={endAt}
                currentGroupFilter={currentGroupFilter}
              />
            </Row>
          </GraphsContainer>
        </ThemeProvider>
      </>
    );
  }
}

const Data = adopt<DataProps, {}>({
  groups: <GetGroups />
});

const UsersDashBoardWithHOCs = injectTracks<Props>({
  trackFilterOnGroup: tracks.filteredOnGroup,
})(localize<Props & Tracks>(UsersDashboard));

export default () => (
  <Data>
    {dataProps => <UsersDashBoardWithHOCs {...dataProps} />}
  </Data>
);
