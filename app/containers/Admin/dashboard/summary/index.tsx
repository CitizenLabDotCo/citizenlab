// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
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
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';

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
  groups: GetGroupsChildProps;
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  currentResourceByTopic: IResource;
  currentResourceByProject: IResource;
}

class DashboardPageSummary extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {
  resourceOptions: IOption[];
  filterOptions: {
    projectFilterOptions: IOption[],
    groupFilterOptions: IOption[],
    topicFilterOptions: IOption[]
  };

  constructor(props: Props & InjectedIntlProps & InjectedLocalized) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentProjectFilter: null,
      currentGroupFilter: null,
      currentTopicFilter: null,
      currentResourceByTopic: 'Ideas',
      currentResourceByProject: 'Ideas'
    };
    this.resourceOptions = [
      { value: 'Ideas', label: props.intl.formatMessage(messages['Ideas']) },
      { value: 'Comments', label: props.intl.formatMessage(messages['Comments']) },
      { value: 'Votes', label: props.intl.formatMessage(messages['Votes']) }
    ];
    this.filterOptions = {
      projectFilterOptions: this.generateFilterOptions('project'),
      groupFilterOptions: this.generateFilterOptions('group'),
      topicFilterOptions: this.generateFilterOptions('topic')
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.projects !== prevProps.projects) {
      this.filterOptions.projectFilterOptions = this.generateFilterOptions('project');
    }
    if (this.props.topics !== prevProps.topics) {
      this.filterOptions.topicFilterOptions = this.generateFilterOptions('topic');
    }
    if (this.props.groups !== prevProps.groups) {
      this.filterOptions.groupFilterOptions = this.generateFilterOptions('group');
    }
  }

  changeInterval = (interval: 'weeks' | 'months' | 'years') => {
    this.setState({ interval, intervalIndex: 0 });
  }

  changeIntervalIndex = (intervalIndex: number) => {
    this.setState({ intervalIndex });
  }

  handleOnProjectFilter = (filter) => {
    this.setState({ currentProjectFilter: filter.value });
  }

  handleOnGroupFilter = (filter) => {
    this.setState({ currentGroupFilter: filter.value });
  }

  handleOnTopicFilter = (filter) => {
    this.setState({ currentTopicFilter: filter.value });
  }

  onResourceByTopicChange = (option) => {
    this.setState({ currentResourceByTopic: option.value });
  }
  onResourceByProjectChange = (option) => {
    this.setState({ currentResourceByProject: option.value });
  }

  generateFilterOptions = (filter: 'project' | 'group' | 'topic') => {
    const { projects,
      projects: { projectsList },
      groups,
      groups: { groupsList },
      topics,
      localize } = this.props;

    let filterOptions: IOption[] = [];

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
        filterOptions = topics.filter(topic => !isNilOrError(topic)).map((topic: ITopicData) => {
          return {
            value: topic.id,
            label: localize(topic.attributes.title_multiloc),
          };
        });
      }
    }

    filterOptions = [{ value: '', label: 'All' }, ...filterOptions];
    return filterOptions;
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
              showProjectFilter: true,
              showGroupFilter: true,
              showTopicFilter: true
            }}
            filters={{
              currentProjectFilter,
              currentGroupFilter,
              currentTopicFilter
            }}
            filterOptions={this.filterOptions}
            onFilter={{
              onProjectFilter: this.handleOnProjectFilter,
              onGroupFilter: this.handleOnGroupFilter,
              onTopicFilter: this.handleOnTopicFilter
            }}
          />

          <ThemeProvider theme={chartTheme}>
            <GraphsContainer>
              <Line>
                <GraphCard className="first halfWidth">
                    {/* <GraphCardTitle>
                      <FormattedMessage {...messages.registeredUsersByTimeTitle} />
                    </GraphCardTitle> */}
                    <UsersByTimeChart
                      startAt={startAt}
                      endAt={endAt}
                      resolution={resolution}
                      {...this.state}
                    />
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
                {/* <GraphCard className="halfWidth">
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
                </GraphCard> */}
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
                      projectOptions={this.filterOptions.projectFilterOptions}
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
                      topicOptions={this.filterOptions.topicFilterOptions}
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

const DashboardPageSummaryWithHOCs =  localize<Props>(injectIntl(DashboardPageSummary));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps =>  <DashboardPageSummaryWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
