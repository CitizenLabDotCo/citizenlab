import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import moment, { Moment } from 'moment';

// services
import {
  activeUsersByTimeStream,
  activeUsersByTimeXlsxEndpoint,
} from 'services/stats';

// components
import { Title } from '@citizenlab/cl2-component-library';
import { GraphsContainer, Column } from 'components/admin/GraphWrappers';
import Outlet from 'components/Outlet';
import ChartFilters from './ChartFilters';
import RegistrationsByTimeCard from 'components/admin/GraphCards/RegistrationsByTimeCard';
import BarChartActiveUsersByTime from './charts/BarChartActiveUsersByTime';
const Management = lazy(() => import('./Management'));
const PostsByTimeCard = lazy(
  () => import('components/admin/GraphCards/PostsByTimeCard')
);
const VotesByTimeCard = lazy(
  () => import('components/admin/GraphCards/VotesByTimeCard')
);
const CommentsByTimeCard = lazy(
  () => import('components/admin/GraphCards/CommentsByTimeCard')
);

const SelectableResourceByTopicChart = lazy(
  () => import('./charts/SelectableResourceByTopicChart')
);
const SelectableResourceByProjectChart = lazy(
  () => import('./charts/SelectableResourceByProjectChart')
);

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
import { IResolution } from 'components/admin/ResolutionControl';

export type IResource = 'ideas' | 'comments' | 'votes';
export type TMomentTime = Moment | null;

const OverviewDashboard = () => {
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
  const [startAtMoment, setStartAtMoment] = useState<Moment | null>(null);
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
            stream={activeUsersByTimeStream}
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
          <Suspense fallback={null}>
            <PostsByTimeCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
          </Suspense>
          <Suspense fallback={null}>
            <CommentsByTimeCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
          </Suspense>
          <Suspense fallback={null}>
            <VotesByTimeCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
          </Suspense>
        </Column>
        <Column>
          <Outlet
            id="app.containers.Admin.dashboard.summary.proposals"
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />

          <Suspense fallback={null}>
            <SelectableResourceByProjectChart
              className="dynamicHeight fullWidth e2e-resource-by-project-chart"
              onResourceByProjectChange={onResourceByProjectChange}
              resourceOptions={resourceOptions}
              {...legacyProps}
            />
          </Suspense>
          <Suspense fallback={null}>
            <SelectableResourceByTopicChart
              className="fullWidth dynamicHeight e2e-resource-by-topic-chart"
              onResourceByTopicChange={onResourceByTopicChange}
              resourceOptions={resourceOptions}
              {...legacyProps}
            />
          </Suspense>
        </Column>
        <Suspense fallback={null}>
          <Management
            currentProjectFilter={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
        </Suspense>
      </GraphsContainer>
    </>
  );
};

export default OverviewDashboard;
