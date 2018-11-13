// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import moment, { Moment } from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import TimeControl from '../components/TimeControl';
import ResolutionControl, { IResolution } from '../components/ResolutionControl';
import FilterableBarChartResourceByTopic from './charts/FilterableBarChartResourceByTopic';
import FilterableBarChartResourceByProject from './charts/FilterableBarChartResourceByProject';
import ChartFilters from '../components/ChartFilters';
import { chartTheme, GraphsContainer, Row, ControlBar, Column } from '../';
import CumulativeAreaChart from './charts/CumulativeAreaChart';
import BarChartByTime from './charts/BarChartByTime';
import AreaChartVotesByTime from './charts/AreaChartVotesByTime';

// typings
import { IOption } from 'typings';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';
import {
  usersByTimeCumulativeStream,
  activeUsersByTimeStream,
  ideasByTimeCumulativeStream,
  commentsByTimeCumulativeStream,
} from 'services/stats';

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
  resolution: IResolution;
  startAtMoment?: Moment | null | undefined;
  endAtMoment: Moment | null;
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
      resolution: 'month',
      startAtMoment: undefined,
      endAtMoment: moment(),
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

  handleChangeResolution = (resolution: IResolution) => {
    this.setState({ resolution });
  }

  handleChangeTimeRange = (startAtMoment: Moment | null | undefined, endAtMoment: Moment | null) => {
    const timeDiff = endAtMoment && startAtMoment && moment.duration(endAtMoment.diff(startAtMoment));
    const resolution = timeDiff ? (timeDiff.asMonths() > 6 ? 'month' : timeDiff.asWeeks() > 4 ? 'week' : 'day')
      : 'month';
    this.setState({ startAtMoment, endAtMoment, resolution });
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
      resolution,
      startAtMoment,
      endAtMoment,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter,
      currentResourceByProject,
      currentResourceByTopic } = this.state;
    const startAt = startAtMoment && startAtMoment.toISOString();
    const endAt = endAtMoment && endAtMoment.toISOString();
    const infoMessage = this.props.intl.formatMessage(messages.activeUsersDescription);

    const { projects, projects: { projectsList } } = this.props;

    if (projects && !isNilOrError(projectsList)) {
      return (
        <>
          <ControlBar>
            <TimeControl
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              onChange={this.handleChangeTimeRange}
            />
            <ResolutionControl
              value={resolution}
              onChange={this.handleChangeResolution}
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
              <Row>
                <CumulativeAreaChart
                  className="first halfWidth"
                  graphTitleMessageKey="usersByTimeTitle"
                  graphUnit="Users"
                  startAt={startAt}
                  endAt={endAt}
                  resolution={resolution}
                  stream={usersByTimeCumulativeStream}
                  {...this.state}
                />
                <BarChartByTime
                  className="halfWidth"
                  graphUnit="ActiveUsers"
                  graphTitleMessageKey="activeUsersByTimeTitle"
                  startAt={startAt}
                  endAt={endAt}
                  resolution={resolution}
                  stream={activeUsersByTimeStream}
                  infoMessage={infoMessage}
                  {...this.state}
                />
              </Row>
              <Row>
                <CumulativeAreaChart
                  className="first halfWidth"
                  graphTitleMessageKey="ideasByTimeTitle"
                  graphUnit="Ideas"
                  startAt={startAt}
                  endAt={endAt}
                  resolution={resolution}
                  stream={ideasByTimeCumulativeStream}
                  {...this.state}
                />
                <CumulativeAreaChart
                  className="halfWidth"
                  graphTitleMessageKey="commentsByTimeTitle"
                  graphUnit="Comments"
                  startAt={startAt}
                  endAt={endAt}
                  resolution={resolution}
                  stream={commentsByTimeCumulativeStream}
                  {...this.state}
                />
              </Row>
              <Row>
                <Column className="first">
                  <AreaChartVotesByTime
                    className="colFirst"
                    startAt={startAt}
                    endAt={endAt}
                    resolution={resolution}
                    {...this.state}
                  />
                  <FilterableBarChartResourceByProject
                    className="dynamicHeight"
                    projectOptions={this.filterOptions.projectFilterOptions}
                    onResourceByProjectChange={this.onResourceByProjectChange}
                    currentResourceByProject={currentResourceByProject}
                    resourceOptions={this.resourceOptions}
                    startAt={startAt}
                    endAt={endAt}
                    selectedResource={currentResourceByProject}
                    {...this.state}
                  />
                </Column>
                <FilterableBarChartResourceByTopic
                  className="halfWidth dynamicHeight"
                  topicOptions={this.filterOptions.topicFilterOptions}
                  onResourceByTopicChange={this.onResourceByTopicChange}
                  currentResourceByTopic={currentResourceByTopic}
                  resourceOptions={this.resourceOptions}
                  startAt={startAt}
                  endAt={endAt}
                  selectedResource={currentResourceByTopic}
                  {...this.state}
                />
              </Row>
            </GraphsContainer>
          </ThemeProvider>
        </>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  projects: (
    <GetProjects
      publicationStatuses={['draft', 'published', 'archived']}
      filterCanModerate={true}
    />),
  groups: <GetGroups />,
  topics: <GetTopics />,
});

const DashboardPageSummaryWithHOCs = localize<Props>(injectIntl(DashboardPageSummary));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <DashboardPageSummaryWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
