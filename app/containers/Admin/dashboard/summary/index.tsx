// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import styled, { ThemeProvider } from 'styled-components';

// components
import TimeControl from '../components/TimeControl';
import IntervalControl from '../components/IntervalControl';
import IdeasByTimeChart from '../components/IdeasByTimeChart';
import CommentsByTimeChart from '../components/CommentsByTimeChart';
import VotesByTimeChart from '../components/VotesByTimeChart';
import UsersByTimeChart from '../components/UsersByTimeChart';
import ResourceByTopicWithFilterChart from '../components/ResourceByTopicWithFilterChart';
import ResourceByProjectWithFilterChart from '../components/ResourceByProjectWithFilterChart';
import ActiveUsersByTimeChart from '../components/ActiveUsersByTimeChart';
import ChartFilters from '../components/ChartFilters';
import { chartTheme, GraphsContainer, Line, GraphCard, GraphCardInner, GraphCardTitle, ControlBar, Column } from '../';
import Select from 'components/UI/Select';

// typings
import { IOption } from 'typings';

// i18n
import messages from '../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';

const SSelect = styled(Select)`
  flex: 1;
  & > * {
    flex: 1;
  }
`;

export type IResource = 'Ideas' | 'Comments' | 'Votes';

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
  currentProjectFilter: string;
  currentGroupFilter: string;
  currentTopicFilter: string;
  currentResourceByTopic: IResource;
  currentResourceByProject: IResource;
}

class DashboardPageSummary extends PureComponent<Props & InjectedIntlProps, State> {
  resourceOptions: IOption[];

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentProjectFilter: 'all',
      currentGroupFilter: 'all',
      currentTopicFilter: 'all',
      currentResourceByTopic: 'Ideas',
      currentResourceByProject: 'Ideas'
    };
    this.resourceOptions = [
      { value: 'Ideas', label: props.intl.formatMessage(messages['Ideas']) },
      { value: 'Comments', label: props.intl.formatMessage(messages['Comments']) },
      { value: 'Votes', label: props.intl.formatMessage(messages['Votes']) }
    ];
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

  onResourceByTopicChange = (option) => {
    this.setState({ currentResourceByTopic: option.value });
  }
  onResourceByProjectChange = (option) => {
    this.setState({ currentResourceByProject: option.value });
  }

  render() {
    const {
      interval,
      intervalIndex,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter,
      currentResourceByProject,
      currentResourceByTopic } = this.state;
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
                <Column className="first">
                <GraphCard className="colFirst">
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
                <GraphCard className="dynamicHeight">
                  <GraphCardInner>
                    <GraphCardTitle>
                      <SSelect
                        id="projectFilter"
                        onChange={this.onResourceByProjectChange}
                        value={currentResourceByProject}
                        options={this.resourceOptions}
                        clearable={false}
                        borderColor="#EAEAEA"
                      />
                      <FormattedMessage {...messages.byProjectTitle} />
                    </GraphCardTitle>
                    <ResourceByProjectWithFilterChart
                      startAt={startAt}
                      endAt={endAt}
                      selectedResource={currentResourceByProject}
                      {...this.state}
                    />
                  </GraphCardInner>
                </GraphCard>
              </Column>
                <GraphCard className="halfWidth dynamicHeight">
                  <GraphCardInner>
                    <GraphCardTitle>
                      <SSelect
                        id="topicFilter"
                        onChange={this.onResourceByTopicChange}
                        value={currentResourceByTopic}
                        options={this.resourceOptions}
                        clearable={false}
                        borderColor="#EAEAEA"
                      />
                      <FormattedMessage {...messages.byTopicTitle} />
                    </GraphCardTitle>
                    <ResourceByTopicWithFilterChart
                      startAt={startAt}
                      endAt={endAt}
                      selectedResource={currentResourceByTopic}
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

const DashboardPageSummaryWithHoCs = injectIntl(DashboardPageSummary);

export default (inputProps: InputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true}>
    {projects => <DashboardPageSummaryWithHoCs {...inputProps} projects={projects} />}
  </GetProjects>
);
