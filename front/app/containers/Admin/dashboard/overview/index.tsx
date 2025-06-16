import React, { useState, useCallback, useMemo } from 'react';

import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';

import useAuthUser from 'api/me/useAuthUser';

import CommentsByTimeCard from 'components/admin/GraphCards/CommentsByTimeCard';
import InputsByTimeCard from 'components/admin/GraphCards/InputsByTimeCard';
import ParticipantsCard from 'components/admin/GraphCards/ParticipantsCard';
import ReactionsByTimeCard from 'components/admin/GraphCards/ReactionsByTimeCard';
import RegistrationsCard from 'components/admin/GraphCards/RegistrationsCard';
import { GraphsContainer, Column } from 'components/admin/GraphWrappers';
import { IResolution } from 'components/admin/ResolutionControl';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import tracks from '../tracks';

import ChartFilters from './ChartFilters';
import EmailDeliveriesCard from './charts/EmailDeliveriesCard';
import EventsCard from './charts/EventsCard';
import InputStatusCard from './charts/InputStatusCard';
import InvitationsCard from './charts/InvitationsCard';
import ProjectStatusCard from './charts/ProjectStatusCard';
import SelectableResourceByProjectChart from './charts/SelectableResourceByProjectChart';
import SelectableResourceByTopicChart from './charts/SelectableResourceByTopicChart';
import { getSensibleResolution } from './getSensibleResolution';
import overviewMessages from './messages';

export type IResource = 'ideas' | 'comments' | 'reactions';

const OverviewDashboard = () => {
  const isSmallerThanSmallDesktop = useBreakpoint('smallDesktop');
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
      trackEventByName(tracks.filteredOnProject, {
        filterValue: filter.value,
        filterLabel: filter.label,
      });

      setCurrentProjectFilter(filter.value);
      setCurrentProjectFilterLabel(filter.label);
    },
    []
  );

  const onResourceByTopicChange = useCallback((option) => {
    trackEventByName(tracks.choseResource, {
      newResource: option,
      graph: 'resourceByTopic',
    });

    setCurrentResourceByTopic(option.value);
  }, []);

  const onResourceByProjectChange = useCallback((option) => {
    trackEventByName(tracks.choseResource, {
      newResource: option,
      graph: 'resourceByProject',
    });

    setCurrentResourceByProject(option.value);
  }, []);

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
        projectId={currentProjectFilter}
        resolution={resolution}
        onChangeTimeRange={handleChangeTimeRange}
        onProjectFilter={handleOnProjectFilter}
        onChangeResolution={handleChangeResolution}
      />
      <GraphsContainer>
        <Column>
          {/* Registration data is hidden when the user filters by project because it is not available. For more details, refer to: https://www.notion.so/govocal/Gent-is-struggling-to-access-the-data-on-their-visitor-dashboard-cecae17322a24ccdb4bd938a511159cc?d=78857b76019144ee97b6bd8de960ead1 */}
          {!currentProjectFilter && (
            <RegistrationsCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
              layout={isSmallerThanSmallDesktop ? 'narrow' : 'wide'}
              hideRegistrationRate
            />
          )}
        </Column>
        <Column fullWidth={!!currentProjectFilter}>
          <ParticipantsCard
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
            layout={isSmallerThanSmallDesktop ? 'narrow' : 'wide'}
            hideParticipationRate
          />
        </Column>
        <Title ml="12px" mt="40px" width="100%" variant="h2" color="primary">
          {formatMessage(overviewMessages.projectsAndParticipation)}
        </Title>
        <Column>
          <ProjectStatusCard
            projectId={currentProjectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={resolution}
          />
          <InputsByTimeCard
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
          <Title ml="12px" mt="40px" width="100%" variant="h2" color="primary">
            {formatMessage(overviewMessages.management)}
          </Title>
          <Column>
            <InputStatusCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
            <EventsCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
          </Column>
          <Column>
            <EmailDeliveriesCard
              projectId={currentProjectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={resolution}
            />
            <InvitationsCard
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

export default OverviewDashboard;
