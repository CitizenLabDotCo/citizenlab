import React, { useState, useCallback, useMemo } from 'react';
import moment, { Moment } from 'moment';

// services

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// components
import { Title } from '@citizenlab/cl2-component-library';
import { GraphsContainer, Column } from 'components/admin/GraphWrappers';
import Outlet from 'components/Outlet';
import ChartFilters from './ChartFilters';
import BarChartActiveUsersByTime from './charts/BarChartActiveUsersByTime';
import SelectableResourceByProjectChart from './charts/SelectableResourceByProjectChart';
import SelectableResourceByTopicChart from './charts/SelectableResourceByTopicChart';
import PostByTimeCard from 'components/admin/GraphCards/PostsByTimeCard';
import ReactionsByTimeCard from 'components/admin/GraphCards/ReactionsByTimeCard';
import CommentsByTimeCard from 'components/admin/GraphCards/CommentsByTimeCard';
import RegistrationsByTimeCard from 'components/admin/GraphCards/RegistrationsByTimeCard';

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
import { PublicationStatus } from 'api/projects/types';
import { IResolution } from 'components/admin/ResolutionControl';
import { isNilOrError } from 'utils/helperUtils';
import { activeUsersByTimeXlsxEndpoint } from 'api/active_users_by_time/util';

interface DataProps {
  projects: GetProjectsChildProps;
}

export type IResource = 'ideas' | 'comments' | 'reactions';

const OverviewDashboard = ({ projects }: DataProps) => {
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();

  const resourceOptions = useMemo(
    () => [
      { value: 'ideas', label: formatMessage(messages.inputs) },
      { value: 'comments', label: formatMessage(messages.comments) },
      { value: 'reactions', label: formatMessage(messages.reactions) },
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
        <Column>
          <RegistrationsByTimeCard
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
        </Column>
        <Column>
          <BarChartActiveUsersByTime
            graphUnit="users"
            graphUnitMessageKey="activeUsers"
            graphTitle={formatMessage(messages.activeUsersByTimeTitle)}
            xlsxEndpoint={activeUsersByTimeXlsxEndpoint}
            infoMessage={formatMessage(
              messages.numberOfActiveParticipantsDescription
            )}
            className="e2e-users-by-time-cumulative-chart fullWidth"
            {...legacyProps}
          />
        </Column>
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
          <PostByTimeCard
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
          <CommentsByTimeCard
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
          <ReactionsByTimeCard
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
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
  <GetProjects publicationStatuses={publicationStatuses} canModerate={true}>
    {(projects) => <OverviewDashboard projects={projects} />}
  </GetProjects>
);
