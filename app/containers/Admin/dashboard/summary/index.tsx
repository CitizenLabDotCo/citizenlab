// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import TimeControl from '../components/TimeControl';
import IntervalControl from '../components/IntervalControl';
import IdeasByTimeChart from '../components/IdeasByTimeChart';
import UsersByTimeChart from '../components/UsersByTimeChart';
import IdeasByTopicChart from '../components/IdeasByTopicChart';
import ActiveUsersByTimeChart from '../components/ActiveUsersByTimeChart';
import ChartFilters from '../components/ChartFilters';
import { chartTheme, Container, GraphsContainer, Line, GraphCard, GraphCardInner, GraphCardTitle, ControlBar } from '../';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  visibleProjects?: string[];
}

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
}

export default class DashboardPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
    };
  }

  changeInterval = (interval: 'weeks' | 'months' | 'years') => {
    this.setState({ interval, intervalIndex: 0 });
  }

  changeIntervalIndex = (intervalIndex: number) => {
    this.setState({ intervalIndex });
  }

  handleOnProjectFilter = (filter) => {
    // To be implemented
    this.setState({ currentProjectFilter: filter });
  }

  handleOnGroupFilter = (filter) => {
    // To be implemented
    this.setState({ currentGroupFilter: filter });
  }

  handleOnTopicFilter = (filter) => {
    // To be implemented
    this.setState({ currentTopicFilter: filter });
  }

  render() {

    const { interval, intervalIndex } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();
    const resolution = (interval === 'years' ? 'month' : 'day');

    return (
      <Container>
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
          currentProjectFilter={this.state.currentProjectFilter}
          currentGroupFilter={this.state.currentGroupFilter}
          currentTopicFilter={this.state.currentTopicFilter}
          projectFilterOptions={['Project A', 'Project B']}
          groupFilterOptions={['Group A', 'Group B']}
          topicFilterOptions={['Topic A', 'Topic B']}
          onProjectFilter={this.handleOnProjectFilter}
          onGroupFilter={this.handleOnGroupFilter}
          onTopicFilter={this.handleOnTopicFilter}
        />

        <ThemeProvider theme={chartTheme}>
          <GraphsContainer>
            <Line>
              <GraphCard className="first halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.registeredUsersByTimeTitle} />
                  </GraphCardTitle>
                  <UsersByTimeChart
                    startAt={startAt}
                    endAt={endAt}
                    resolution={resolution}
                    currentProjectFilter={this.state.currentProjectFilter}
                    currentGroupFilter={this.state.currentGroupFilter}
                    currentTopicFilter={this.state.currentTopicFilter}
                  />
                </GraphCardInner>
              </GraphCard>
              <GraphCard className="halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.activeUsersByTimeTitle} />
                  </GraphCardTitle>
                  <ActiveUsersByTimeChart
                    startAt={startAt}
                    endAt={endAt}
                    resolution={resolution}
                    currentProjectFilter={this.state.currentProjectFilter}
                    currentGroupFilter={this.state.currentGroupFilter}
                    currentTopicFilter={this.state.currentTopicFilter}
                  />
                </GraphCardInner>
              </GraphCard>
            </Line>
            <Line>
              <GraphCard className="first halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.ideasByTimeTitle} />
                  </GraphCardTitle>
                  <IdeasByTimeChart
                    startAt={startAt}
                    endAt={endAt}
                    resolution={resolution}
                    currentProjectFilter={this.state.currentProjectFilter}
                    currentGroupFilter={this.state.currentGroupFilter}
                    currentTopicFilter={this.state.currentTopicFilter}
                  />
                </GraphCardInner>
              </GraphCard>
              <GraphCard className="halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.activeUsersByTimeTitle} />
                  </GraphCardTitle>
                  <ActiveUsersByTimeChart
                    startAt={startAt}
                    endAt={endAt}
                    resolution={resolution}
                    currentProjectFilter={this.state.currentProjectFilter}
                    currentGroupFilter={this.state.currentGroupFilter}
                    currentTopicFilter={this.state.currentTopicFilter}
                  />
                </GraphCardInner>
              </GraphCard>
            </Line>
          </GraphsContainer>
        </ThemeProvider>
      </Container>
    );
  }
}
