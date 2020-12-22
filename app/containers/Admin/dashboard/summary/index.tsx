// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import moment, { Moment } from 'moment';
import { ThemeProvider } from 'styled-components';
import { chartTheme } from '../index';

// components
import { GraphsContainer, ControlBar, Column, IResolution } from '../';
import BarChartActiveUsersByTime from './charts/BarChartActiveUsersByTime';
import LineBarChart from './charts/LineBarChart';
import ChartFilters from '../components/ChartFilters';
import SelectableResourceByProjectChart from './charts/SelectableResourceByProjectChart';
import SelectableResourceByTopicChart from './charts/SelectableResourceByTopicChart';
import ResolutionControl from '../components/ResolutionControl';
import LineBarChartVotesByTime from './charts/LineBarChartVotesByTime';
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
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';
import {
  usersByTimeCumulativeStream,
  activeUsersByTimeStream,
  usersByTimeStream,
  commentsByTimeStream,
  ideasByTimeCumulativeStream,
  commentsByTimeCumulativeStream,
  activeUsersByTimeXlsxEndpoint,
  ideasByTimeCumulativeXlsxEndpoint,
  commentsByTimeCumulativeXlsxEndpoint,
  ideasByTimeStream,
  usersByTimeXlsxEndpoint,
} from 'services/stats';
import IdeasByStatusChart from '../components/IdeasByStatusChart';

export type IResource = 'ideas' | 'comments' | 'votes';

export interface InputProps {
  onlyModerator?: boolean;
}

interface DataProps {
  projects: GetProjectsChildProps;
  groups: GetGroupsChildProps;
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  resolution: IResolution;
  startAtMoment?: Moment | null | undefined;
  endAtMoment: Moment | null;
  currentProjectFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilter: string | undefined;
  currentTopicFilterLabel: string | undefined;
  currentResourceByTopic: IResource;
  currentResourceByProject: IResource;
  projectFilterOptions: IOption[];
  groupFilterOptions: IOption[];
  topicFilterOptions: IOption[];
}

interface Tracks {
  trackFilterOnGroup: Function;
  trackFilterOnProject: Function;
  trackFilterOnTopic: Function;
  trackResourceChange: Function;
}

interface PropsHithHoCs
  extends Props,
    InjectedIntlProps,
    InjectedLocalized,
    Tracks {}

class DashboardPageSummary extends PureComponent<PropsHithHoCs, State> {
  resourceOptions: IOption[];

  constructor(props: PropsHithHoCs) {
    super(props);
    const { onlyModerator } = props;
    const { projectsList } = props.projects;
    const { formatMessage } = props.intl;

    this.state = {
      resolution: 'month',
      startAtMoment: undefined,
      endAtMoment: moment(),
      currentProjectFilter: onlyModerator
        ? projectsList && projectsList.length > 0
          ? projectsList[0].id
          : undefined
        : undefined,
      currentProjectFilterLabel: undefined,
      currentGroupFilter: undefined,
      currentGroupFilterLabel: undefined,
      currentTopicFilter: undefined,
      currentTopicFilterLabel: undefined,
      currentResourceByTopic: 'ideas',
      currentResourceByProject: 'ideas',
      projectFilterOptions: this.generateProjectOptions(),
      groupFilterOptions: this.generateGroupsOptions(),
      topicFilterOptions: this.generateTopicOptions(),
    };

    this.resourceOptions = [
      { value: 'ideas', label: formatMessage(messages.inputs) },
      { value: 'comments', label: formatMessage(messages.comments) },
      { value: 'votes', label: formatMessage(messages.votes) },
    ];
  }

  componentDidUpdate(prevProps: Props) {
    const {
      projects: { projectsList },
      topics,
      groups,
      onlyModerator,
    } = this.props;

    if (projectsList !== prevProps.projects.projectsList) {
      this.setState({ projectFilterOptions: this.generateProjectOptions() });
      if (onlyModerator && this.state.currentProjectFilter === null) {
        this.setState({
          currentProjectFilter:
            projectsList && projectsList.length > 0
              ? projectsList[0].id
              : undefined,
        });
      }
    }

    if (topics !== prevProps.topics) {
      this.setState({ topicFilterOptions: this.generateTopicOptions() });
    }

    if (groups !== prevProps.groups) {
      this.setState({ groupFilterOptions: this.generateGroupsOptions() });
    }
  }

  handleChangeResolution = (resolution: IResolution) => {
    this.setState({ resolution });
  };

  handleChangeTimeRange = (
    startAtMoment: Moment | null | undefined,
    endAtMoment: Moment | null
  ) => {
    const timeDiff =
      endAtMoment &&
      startAtMoment &&
      moment.duration(endAtMoment.diff(startAtMoment));
    const resolution = timeDiff
      ? timeDiff.asMonths() > 6
        ? 'month'
        : timeDiff.asWeeks() > 4
        ? 'week'
        : 'day'
      : 'month';
    this.setState({ startAtMoment, endAtMoment, resolution });
  };

  handleOnProjectFilter = (filter) => {
    this.props.trackFilterOnProject({ extra: { project: filter } });
    this.setState({
      currentProjectFilter: filter.value,
      currentProjectFilterLabel: filter.label,
    });
  };

  handleOnGroupFilter = (filter) => {
    this.props.trackFilterOnGroup({ extra: { group: filter } });
    this.setState({
      currentGroupFilter: filter.value,
      currentGroupFilterLabel: filter.label,
    });
  };

  handleOnTopicFilter = (filter) => {
    this.props.trackFilterOnTopic({ extra: { topic: filter } });
    this.setState({
      currentTopicFilter: filter.value,
      currentTopicFilterLabel: filter.label,
    });
  };

  onResourceByTopicChange = (option) => {
    this.props.trackResourceChange({
      extra: { newResource: option, graph: 'resourceByTopic' },
    });
    this.setState({ currentResourceByTopic: option.value });
  };

  onResourceByProjectChange = (option) => {
    this.props.trackResourceChange({
      extra: { newResource: option, graph: 'resourceByProject' },
    });
    this.setState({ currentResourceByProject: option.value });
  };

  generateProjectOptions = () => {
    const {
      projects,
      projects: { projectsList },
      localize,
      onlyModerator,
      intl: { formatMessage },
    } = this.props;
    let filterOptions: IOption[] = [];

    if (!isNilOrError(projects) && !isNilOrError(projectsList)) {
      filterOptions = projectsList.map((project) => ({
        value: project.id,
        label: localize(project.attributes.title_multiloc),
      }));
    }

    if (!onlyModerator) {
      filterOptions = [
        { value: '', label: formatMessage(messages.allProjects) },
        ...filterOptions,
      ];
    }

    return filterOptions;
  };

  generateGroupsOptions = () => {
    const {
      groups,
      groups: { groupsList },
      intl: { formatMessage },
      localize,
    } = this.props;
    let filterOptions: IOption[] = [];

    if (!isNilOrError(groups) && !isNilOrError(groupsList)) {
      filterOptions = groupsList.map((group) => ({
        value: group.id,
        label: localize(group.attributes.title_multiloc),
      }));
    }

    return [
      { value: '', label: formatMessage(messages.allGroups) },
      ...filterOptions,
    ];
  };

  generateTopicOptions = () => {
    const {
      topics,
      localize,
      intl: { formatMessage },
    } = this.props;
    let filterOptions: IOption[] = [];

    if (!isNilOrError(topics)) {
      filterOptions = topics
        .filter((topic) => !isNilOrError(topic))
        .map((topic: ITopicData) => {
          return {
            value: topic.id,
            label: localize(topic.attributes.title_multiloc),
          };
        });
    }

    return [
      { value: '', label: formatMessage(messages.allTopics) },
      ...filterOptions,
    ];
  };

  render() {
    const {
      resolution,
      startAtMoment,
      endAtMoment,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter,
      projectFilterOptions,
      groupFilterOptions,
      topicFilterOptions,
    } = this.state;

    const startAt = startAtMoment && startAtMoment.toISOString();
    const endAt = endAtMoment && endAtMoment.toISOString();

    const {
      projects,
      projects: { projectsList },
      intl: { formatMessage },
    } = this.props;

    const infoMessage = formatMessage(
      messages.numberOfActiveParticipantsDescription
    );

    if (projects && !isNilOrError(projectsList)) {
      return (
        <ThemeProvider theme={chartTheme}>
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
            currentProjectFilter={currentProjectFilter}
            currentGroupFilter={currentGroupFilter}
            currentTopicFilter={currentTopicFilter}
            projectFilterOptions={projectFilterOptions}
            groupFilterOptions={groupFilterOptions}
            topicFilterOptions={topicFilterOptions}
            onProjectFilter={this.handleOnProjectFilter}
            onGroupFilter={this.handleOnGroupFilter}
            onTopicFilter={this.handleOnTopicFilter}
          />
          <GraphsContainer>
            <LineBarChart
              graphUnit="users"
              graphUnitMessageKey="users"
              graphTitle={formatMessage(messages.usersByTimeTitle)}
              startAt={startAt}
              endAt={endAt}
              xlsxEndpoint={usersByTimeXlsxEndpoint}
              lineStream={usersByTimeCumulativeStream}
              barStream={usersByTimeStream}
              className="e2e-active-users-chart"
              {...this.state}
            />
            <BarChartActiveUsersByTime
              graphUnit="users"
              graphUnitMessageKey="activeUsers"
              graphTitle={formatMessage(messages.activeUsersByTimeTitle)}
              startAt={startAt}
              endAt={endAt}
              xlsxEndpoint={activeUsersByTimeXlsxEndpoint}
              stream={activeUsersByTimeStream}
              infoMessage={infoMessage}
              className="e2e-active-users-chart"
              {...this.state}
            />
            <LineBarChart
              graphTitle={formatMessage(messages.inputs)}
              graphUnit="ideas"
              graphUnitMessageKey="ideas"
              startAt={startAt}
              endAt={endAt}
              xlsxEndpoint={ideasByTimeCumulativeXlsxEndpoint}
              className="e2e-ideas-chart"
              lineStream={ideasByTimeCumulativeStream}
              barStream={ideasByTimeStream}
              {...this.state}
            />
            <LineBarChart
              graphTitle={formatMessage(messages.commentsByTimeTitle)}
              graphUnit="comments"
              graphUnitMessageKey="comments"
              startAt={startAt}
              endAt={endAt}
              xlsxEndpoint={commentsByTimeCumulativeXlsxEndpoint}
              className="e2e-comments-chart"
              lineStream={commentsByTimeCumulativeStream}
              barStream={commentsByTimeStream}
              {...this.state}
            />
            <Column>
              <LineBarChartVotesByTime
                className="fullWidth e2e-votes-chart"
                startAt={startAt}
                endAt={endAt}
                {...this.state}
              />
              <SelectableResourceByProjectChart
                className="dynamicHeight fullWidth e2e-resource-by-project-chart"
                onResourceByProjectChange={this.onResourceByProjectChange}
                resourceOptions={this.resourceOptions}
                projectOptions={projectFilterOptions}
                startAt={startAt}
                endAt={endAt}
                {...this.state}
              />
            </Column>
            <Column>
              <IdeasByStatusChart
                className="fullWidth dynamicHeight"
                startAt={startAt}
                endAt={endAt}
                {...this.state}
              />
              <SelectableResourceByTopicChart
                className="fullWidth dynamicHeight e2e-resource-by-topic-chart"
                topicOptions={topicFilterOptions}
                onResourceByTopicChange={this.onResourceByTopicChange}
                resourceOptions={this.resourceOptions}
                startAt={startAt}
                endAt={endAt}
                {...this.state}
              />
            </Column>
          </GraphsContainer>
        </ThemeProvider>
      );
    }
    return null;
  }
}

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const Data = adopt<DataProps, InputProps>({
  groups: <GetGroups />,
  topics: <GetTopics />,
  projects: (
    <GetProjects
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

const DashboardPageSummaryWithHOCs = injectTracks<Props>({
  trackFilterOnGroup: tracks.filteredOnGroup,
  trackFilterOnProject: tracks.filteredOnProject,
  trackFilterOnTopic: tracks.filteredOnTopic,
  trackResourceChange: tracks.choseResource,
})(localize<Props & Tracks>(injectIntl(DashboardPageSummary)));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <DashboardPageSummaryWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
