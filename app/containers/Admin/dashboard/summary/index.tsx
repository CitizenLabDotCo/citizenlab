// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import moment, { Moment } from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import { chartTheme, GraphsContainer, Row, ControlBar, Column, IResolution } from '../';
import BarChartByTime from './charts/BarChartByTime';
import ChartFilters from '../components/ChartFilters';
import CumulativeAreaChart from './charts/CumulativeAreaChart';
import FilterableBarChartResourceByProject from './charts/FilterableBarChartResourceByProject';
import FilterableBarChartResourceByTopic from './charts/FilterableBarChartResourceByTopic';
import ResolutionControl from '../components/ResolutionControl';
import LineChartVotesByTime from './charts/LineChartVotesByTime';
import TimeControl from '../components/TimeControl';

// typings
import { IOption } from 'typings';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

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

export type IResource = 'ideas' | 'comments' | 'votes';

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

interface Tracks {
  trackFilterOnGroup: Function;
  trackFilterOnProject: Function;
  trackFilterOnTopic: Function;
  trackResourceChange: Function;
}

interface PropsHithHoCs extends Props, InjectedIntlProps, InjectedLocalized, Tracks { }

class DashboardPageSummary extends PureComponent<PropsHithHoCs, State> {
  resourceOptions: IOption[];
  filterOptions: {
    projectFilterOptions: IOption[],
    groupFilterOptions: IOption[],
    topicFilterOptions: IOption[]
  };

  constructor(props: PropsHithHoCs) {
    super(props);
    this.state = {
      resolution: 'month',
      startAtMoment: undefined,
      endAtMoment: moment(),
      currentProjectFilter: null,
      currentGroupFilter: null,
      currentTopicFilter: null,
      currentResourceByTopic: 'ideas',
      currentResourceByProject: 'ideas'
    };
    this.resourceOptions = [
      { value: 'ideas', label: props.intl.formatMessage(messages['ideas']) },
      { value: 'comments', label: props.intl.formatMessage(messages['comments']) },
      { value: 'votes', label: props.intl.formatMessage(messages['votes']) }
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
    this.props.trackFilterOnProject({ extra: { project: filter } });
    this.setState({ currentProjectFilter: filter.value });
  }

  handleOnGroupFilter = (filter) => {
    this.props.trackFilterOnGroup({ extra: { group: filter } });
    this.setState({ currentGroupFilter: filter.value });
  }

  handleOnTopicFilter = (filter) => {
    this.props.trackFilterOnTopic({ extra: { topic: filter } });
    this.setState({ currentTopicFilter: filter.value });
  }

  onResourceByTopicChange = (option) => {
    this.props.trackResourceChange({
      extra:
        { newResource: option, graph: 'resourceByTopic' }
    });
    this.setState({ currentResourceByTopic: option.value });
  }

  onResourceByProjectChange = (option) => {
    this.props.trackResourceChange({
      extra:
        { newResource: option, graph: 'resourceByProject' }
    });
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
        filterOptions = topics.filter(topic =>
          !isNilOrError(topic)).map((topic: ITopicData) => {
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
                {/**
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
                  <LineChartVotesByTime
                    className="colFirst"
                    startAt={startAt}
                    endAt={endAt}
                    resolution={resolution}
                    {...this.state}
                  />
                      **/}
                <Column className="first">
                  <FilterableBarChartResourceByProject
                    className="dynamicHeight"
                    onResourceByProjectChange={this.onResourceByProjectChange}
                    resourceOptions={this.resourceOptions}
                    projectOptions={this.filterOptions.projectFilterOptions}
                    startAt={startAt}
                    endAt={endAt}
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

const DashboardPageSummaryWithHOCs = injectTracks<Props>({
  trackFilterOnGroup: tracks.filteredOnGroup,
  trackFilterOnProject: tracks.filteredOnProject,
  trackFilterOnTopic: tracks.filteredOnTopic,
  trackResourceChange: tracks.choseResource,
})(localize<Props & Tracks>(injectIntl(DashboardPageSummary)));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <DashboardPageSummaryWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
