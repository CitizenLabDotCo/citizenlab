// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import TimeControl from '../components/TimeControl';
import IntervalControl from '../components/IntervalControl';
import IdeasByTimeChart from '../components/IdeasByTimeChart';
import CommentsByTimeChart from '../components/CommentsByTimeChart';
import VotesByTimeChart from '../components/VotesByTimeChart';
import UsersByTimeChart from '../components/UsersByTimeChart';
import IdeasByTopicChart from '../components/IdeasByTopicChart';
import ActiveUsersByTimeChart from '../components/ActiveUsersByTimeChart';
import ChartFilters from '../components/ChartFilters';
import { chartTheme, GraphsContainer, Line, GraphCard, GraphCardInner, GraphCardTitle, ControlBar } from '../';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  onlyModerator?: boolean;
}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
}

class DashboardPageSummary extends PureComponent<Props, State> {
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
    const {
      interval,
      intervalIndex,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();
    const resolution = (interval === 'years' ? 'month' : 'day');
    const { projects, projects: { projectsList } } = this.props;

    if (projects && !isNilOrError(projectsList)) {
      console.log(projectsList);

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
            currentProjectFilter={currentProjectFilter}
            currentGroupFilter={currentGroupFilter}
            currentTopicFilter={currentTopicFilter}
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
                      {...this.state}
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
                      {...this.state}
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
                      {...this.state}
                    />
                  </GraphCardInner>
                </GraphCard>
                <GraphCard className="halfWidth">
                  <GraphCardInner>
                    <GraphCardTitle>
                      <FormattedMessage {...messages.commentsByTimeTitle} />
                    </GraphCardTitle>
                    <CommentsByTimeChart
                      startAt={startAt}
                      endAt={endAt}
                      resolution={resolution}
                      {...this.state}
                    />
                  </GraphCardInner>
                </GraphCard>
              </Line>
              <Line>
                <GraphCard className="first halfWidth">
                  <GraphCardInner>
                    <GraphCardTitle>
                      <FormattedMessage {...messages.votesByTimeTitle} />
                    </GraphCardTitle>
                    <VotesByTimeChart
                      startAt={startAt}
                      endAt={endAt}
                      resolution={resolution}
                      {...this.state}
                    />
                  </GraphCardInner>
                </GraphCard>
              </Line>
            </GraphsContainer>
          </ThemeProvider>
        </>
      );
    }
    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true}>
    {projects => <DashboardPageSummary {...inputProps} projects={projects} />}
  </GetProjects>
);
