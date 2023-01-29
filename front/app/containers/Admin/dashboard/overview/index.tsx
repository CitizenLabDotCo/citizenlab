import React, { useState, useCallback, useMemo } from 'react';
import moment, { Moment } from 'moment';

// services
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

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import { GraphsContainer, Column } from 'components/admin/GraphWrappers';
import Outlet from 'components/Outlet';
import ChartFilters from './ChartFilters';
import LineBarChart from './charts/LineBarChart';
import BarChartActiveUsersByTime from './charts/BarChartActiveUsersByTime';
import SelectableResourceByProjectChart from './charts/SelectableResourceByProjectChart';
import SelectableResourceByTopicChart from './charts/SelectableResourceByTopicChart';
import LineBarChartVotesByTime from './charts/LineBarChartVotesByTime';

// i18n
import messages from '../messages';
import overviewMessages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { getSensibleResolution } from './getSensibleResolution';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// typings
import { PublicationStatus } from 'services/projects';
import { IResolution } from 'components/admin/ResolutionControl';
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  projects: GetProjectsChildProps;
}

export type IResource = 'ideas' | 'comments' | 'votes';

const OverviewDashboard = ({ projects }: DataProps) => {
  const user = useAuthUser();
  const { formatMessage } = useIntl();

  const resourceOptions = useMemo(
    () => [
      { value: 'ideas', label: formatMessage(messages.inputs) },
      { value: 'comments', label: formatMessage(messages.comments) },
      { value: 'votes', label: formatMessage(messages.votes) },
    ],
    [formatMessage]
  );

  const [resolution, setResolution] = useState<IResolution>('month');
  const [startAtMoment, setStartAtMoment] = useState<Moment | null | undefined>(
    undefined
  );
  const [endAtMoment, setEndAtMoment] = useState<Moment | null>(moment());
  const [currentProjectFilter, setCurrentProjectFilter] = useState<
    string | undefined
  >(undefined);
  const [currentProjectFilterLabel, setCurrentProjectFilterLabel] = useState<
    string | undefined
  >(undefined);
  const [currentResourceByTopic, setCurrentResourceByTopic] =
    useState<IResource>('ideas');
  const [currentResourceByProject, setCurrentResourceByProject] =
    useState<IResource>('ideas');

  const handleChangeResolution = useCallback((resolution: IResolution) => {
    setResolution(resolution);
  }, []);

  const handleChangeTimeRange = useCallback(
    (startAtMoment: Moment | null, endAtMoment: Moment | null) => {
      const resolution = getSensibleResolution(startAtMoment, endAtMoment);
      setStartAtMoment(startAtMoment);
      setEndAtMoment(endAtMoment);
      setResolution(resolution);
    },
    []
  );

  const handleOnProjectFilter = useCallback(
    (filter: { value: string; label: string }) => {
      trackEventByName(tracks.filteredOnProject.name, { project: filter });

      setCurrentProjectFilter(filter.value);
      setCurrentProjectFilterLabel(filter.label);
    },
    []
  );

  const onResourceByTopicChange = useCallback((option) => {
    trackEventByName(tracks.choseResource.name, {
      newResource: option,
      graph: 'resourceByTopic',
    });

    setCurrentResourceByTopic(option.value);
  }, []);

  const onResourceByProjectChange = useCallback((option) => {
    trackEventByName(tracks.choseResource.name, {
      newResource: option,
      graph: 'resourceByProject',
    });

    setCurrentResourceByProject(option.value);
  }, []);

  if (isNilOrError(projects)) return null;
  if (isNilOrError(user)) return null;

  const { projectsList } = projects;
  if (!projectsList) return null;

  const startAt = startAtMoment && startAtMoment.toISOString();
  const endAt = endAtMoment && endAtMoment.toISOString();

  const legacyProps = {
    startAt,
    endAt,
    resolution,
    currentProjectFilter,
    currentProjectFilterLabel,
    currentResourceByTopic,
    currentResourceByProject,
  };

  return (
    <>
      <ChartFilters
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        currentProjectFilter={currentProjectFilter}
        resolution={resolution}
        onChangeTimeRange={handleChangeTimeRange}
        onProjectFilter={handleOnProjectFilter}
        onChangeResolution={handleChangeResolution}
      />
      <GraphsContainer>
        <Box width="100%" display="flex">
          <LineBarChart
            graphUnit="users"
            graphUnitMessageKey="users"
            graphTitle={formatMessage(messages.usersByTimeTitle)}
            xlsxEndpoint={usersByTimeXlsxEndpoint}
            lineStream={usersByTimeCumulativeStream}
            barStream={usersByTimeStream}
            className="e2e-active-users-chart"
            {...legacyProps}
          />
          <BarChartActiveUsersByTime
            graphUnit="users"
            graphUnitMessageKey="activeUsers"
            graphTitle={formatMessage(messages.activeUsersByTimeTitle)}
            xlsxEndpoint={activeUsersByTimeXlsxEndpoint}
            stream={activeUsersByTimeStream}
            infoMessage={formatMessage(
              messages.numberOfActiveParticipantsDescription
            )}
            className="e2e-users-by-time-cumulative-chart"
            {...legacyProps}
          />
        </Box>
        <Title
          ml="12px"
          mt="40px"
          width="100%"
          variant="h2"
          color="primary"
          fontWeight="normal"
        >
          {formatMessage(overviewMessages.projectsAndParticipation)}
        </Title>
        <Column>
          <Outlet
            id="app.containers.Admin.dashboard.summary.projectStatus"
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
          <LineBarChart
            graphTitle={formatMessage(messages.inputs)}
            graphUnit="ideas"
            graphUnitMessageKey="ideas"
            xlsxEndpoint={ideasByTimeCumulativeXlsxEndpoint}
            className="e2e-ideas-chart fullWidth"
            lineStream={ideasByTimeCumulativeStream}
            barStream={ideasByTimeStream}
            {...legacyProps}
          />
          <LineBarChart
            graphTitle={formatMessage(messages.commentsByTimeTitle)}
            graphUnit="comments"
            graphUnitMessageKey="comments"
            xlsxEndpoint={commentsByTimeCumulativeXlsxEndpoint}
            className="e2e-comments-chart fullWidth"
            lineStream={commentsByTimeCumulativeStream}
            barStream={commentsByTimeStream}
            {...legacyProps}
          />
          <LineBarChartVotesByTime
            className="fullWidth e2e-votes-chart"
            {...legacyProps}
          />
        </Column>
        <Column>
          <Outlet
            id="app.containers.Admin.dashboard.summary.proposals"
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
          <SelectableResourceByProjectChart
            className="dynamicHeight fullWidth e2e-resource-by-project-chart"
            onResourceByProjectChange={onResourceByProjectChange}
            resourceOptions={resourceOptions}
            {...legacyProps}
          />
          <SelectableResourceByTopicChart
            className="fullWidth dynamicHeight e2e-resource-by-topic-chart"
            onResourceByTopicChange={onResourceByTopicChange}
            resourceOptions={resourceOptions}
            {...legacyProps}
          />
        </Column>
        <>
          <Title
            ml="12px"
            mt="40px"
            width="100%"
            variant="h2"
            color="primary"
            fontWeight="normal"
          >
            {formatMessage(overviewMessages.management)}
          </Title>
          <Column>
            <Outlet
              id="app.containers.Admin.dashboard.summary.inputStatus"
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
            <Outlet
              id="app.containers.Admin.dashboard.summary.events"
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
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
            <Outlet
              id="app.containers.Admin.dashboard.summary.invitations"
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
          </Column>
        </>
      </GraphsContainer>
    </>
  );
};

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

export default () => (
  <GetProjects
    publicationStatuses={publicationStatuses}
    filterCanModerate={true}
  >
    {(projects) => <OverviewDashboard projects={projects} />}
  </GetProjects>
);
