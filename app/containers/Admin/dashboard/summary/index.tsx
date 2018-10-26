// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';
import { IOption } from 'typings';

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
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  onlyModerator?: boolean;
}

interface DataProps {
  projects: GetProjectsChildProps;
  groups: GetGroupsChildProps;
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentProjectFilter: string;
  currentGroupFilter: string;
  currentTopicFilter: string;
}

class DashboardPageSummary extends PureComponent<Props & InjectedLocalized, State> {
  constructor(props: Props & InjectedLocalized) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentProjectFilter: 'all',
      currentGroupFilter: 'all',
      currentTopicFilter: 'all',
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

  generateFilterOptions = (filter: 'project' | 'group' | 'topic'): IOption[] => {
    const { projects,
      projects: { projectsList },
      groups,
      groups: { groupsList },
      topics,
      localize } = this.props;

    let filterOptions: IOption[] | [] = [];

    if (filter === 'project') {
      if (!isNilOrError(projects) && projectsList) {
        filterOptions = projectsList.map((project) => (
          {
            value: project.id,
            label: localize(project.attributes.title_multiloc),
          }
        ));
      }
    } else if (filter === 'group') {
      if (!isNilOrError(groups) && !isNilOrError(groupsList)) {
        filterOptions = groupsList.map((group) => (
          {
            value: group.id,
            label: localize(group.attributes.title_multiloc)
          }
        ));
      }
    } else if (filter === 'topic') {
      if (!isNilOrError(topics)) {
        filterOptions = topics.map((topic) => {
            if (isNilOrError(topic)) return { value: '', label: '' };

            return {
              value: topic.id,
              label: localize(topic.attributes.title_multiloc),
            };
        });
      }
    }

    const filterOptionsFinal = [{ value: 'all', label: 'All' }, ...filterOptions];
    return filterOptionsFinal;
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
            projectFilterOptions={this.generateFilterOptions('project')}
            groupFilterOptions={this.generateFilterOptions('group')}
            topicFilterOptions={this.generateFilterOptions('topic')}
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

const Data = adopt<DataProps, InputProps>({
  projects: <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true}/>,
  groups: <GetGroups />,
  topics: <GetTopics />,
});

const DashboardPageSummaryWithHOCs = localize(DashboardPageSummary);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps =>  <DashboardPageSummaryWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
