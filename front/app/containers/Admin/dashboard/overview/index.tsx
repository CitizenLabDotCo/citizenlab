import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import moment, { Moment } from 'moment';

// components
import { GraphsContainer, Column } from 'components/admin/GraphWrappers';
import Outlet from 'components/Outlet';
import ChartFilters from './ChartFilters';
import LineBarChart from './charts/LineBarChart';
import BarChartActiveUsersByTime from './charts/BarChartActiveUsersByTime';
import SelectableResourceByProjectChart from './charts/SelectableResourceByProjectChart';
import SelectableResourceByTopicChart from './charts/SelectableResourceByTopicChart';
import LineBarChartVotesByTime from './charts/LineBarChartVotesByTime';

// typings
import { IOption } from 'typings';
import { IResolution } from 'components/admin/ResolutionControl';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { PublicationStatus } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';
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

// utils
import { getSensibleResolution } from './getSensibleResolution';

export type IResource = 'ideas' | 'comments' | 'votes';

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends DataProps {}

interface State {
  resolution: IResolution;
  startAtMoment?: Moment | null | undefined;
  endAtMoment: Moment | null;
  currentProjectFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentResourceByTopic: IResource;
  currentResourceByProject: IResource;
}

interface Tracks {
  trackFilterOnProject: (args: { extra: Record<string, string> }) => void;
  trackResourceChange: (args: { extra: Record<string, string> }) => void;
}

interface PropsHithHoCs
  extends Props,
    WrappedComponentProps,
    InjectedLocalized,
    Tracks {}

class DashboardPageSummary extends PureComponent<PropsHithHoCs, State> {
  resourceOptions: IOption[];

  constructor(props: PropsHithHoCs) {
    super(props);
    const { formatMessage } = props.intl;

    this.state = {
      resolution: 'month',
      startAtMoment: undefined,
      endAtMoment: moment(),
      currentProjectFilter: undefined,
      currentProjectFilterLabel: undefined,
      currentResourceByTopic: 'ideas',
      currentResourceByProject: 'ideas',
    };

    this.resourceOptions = [
      { value: 'ideas', label: formatMessage(messages.inputs) },
      { value: 'comments', label: formatMessage(messages.comments) },
      { value: 'votes', label: formatMessage(messages.votes) },
    ];
  }

  handleChangeResolution = (resolution: IResolution) => {
    this.setState({ resolution });
  };

  handleChangeTimeRange = (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => {
    const resolution = getSensibleResolution(startAtMoment, endAtMoment);
    this.setState({ startAtMoment, endAtMoment, resolution });
  };

  handleOnProjectFilter = (filter) => {
    this.props.trackFilterOnProject({ extra: { project: filter } });
    this.setState({
      currentProjectFilter: filter.value,
      currentProjectFilterLabel: filter.label,
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

  render() {
    const { resolution, startAtMoment, endAtMoment, currentProjectFilter } =
      this.state;

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
        <>
          <ChartFilters
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            currentProjectFilter={currentProjectFilter}
            resolution={resolution}
            onChangeTimeRange={this.handleChangeTimeRange}
            onProjectFilter={this.handleOnProjectFilter}
            onChangeResolution={this.handleChangeResolution}
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
              className="e2e-users-by-time-cumulative-chart"
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
                startAt={startAt}
                endAt={endAt}
                {...this.state}
              />
            </Column>
            <Column>
              <Outlet
                id="app.containers.Admin.dashboard.summary.inputStatus"
                projectId={currentProjectFilter}
                startAtMoment={startAtMoment}
                endAtMoment={endAtMoment}
                resolution={resolution}
              />
              <SelectableResourceByTopicChart
                className="fullWidth dynamicHeight e2e-resource-by-topic-chart"
                onResourceByTopicChange={this.onResourceByTopicChange}
                resourceOptions={this.resourceOptions}
                startAt={startAt}
                endAt={endAt}
                {...this.state}
              />
            </Column>
            <Column>
              <Outlet
                id="app.containers.Admin.dashboard.summary.emailDeliveries"
                projectId={currentProjectFilter}
                startAtMoment={startAtMoment}
                endAtMoment={endAtMoment}
                resolution={resolution}
              />
            </Column>
          </GraphsContainer>
        </>
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

const Data = adopt<DataProps>({
  projects: (
    <GetProjects
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

const DashboardPageSummaryWithHOCs = injectTracks<Props>({
  trackFilterOnProject: tracks.filteredOnProject,
  trackResourceChange: tracks.choseResource,
})(localize<Props & Tracks>(injectIntl(DashboardPageSummary)));

export default () => (
  <Data>{(dataProps) => <DashboardPageSummaryWithHOCs {...dataProps} />}</Data>
);
