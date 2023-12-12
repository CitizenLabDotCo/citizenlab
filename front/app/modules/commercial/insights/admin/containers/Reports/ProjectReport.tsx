import React, { useState, useEffect } from 'react';
import useLocalize from 'hooks/useLocalize';
import { isEqual } from 'lodash-es';

// resources
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import messages from './messages';
import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';
import { GraphsContainer, Column } from 'components/admin/GraphWrappers';

import { colors } from 'utils/styleUtils';
import { MessageDescriptor } from 'react-intl';

// services

// components
import { SectionTitle, PageTitle } from 'components/admin/Section';
import T from 'components/T';

import HorizontalBarChartWithoutStream from './Charts/HorizontalBarChartWithoutStream';
import IdeasByStatusChart from './Charts/IdeasByStatusChart';
import ParticipationPerTopic from './Charts/ParticipationPerTopic';
import BarChartActiveUsersByTime from './Charts/BarChartActiveUsersByTime';
import PollReport from './PollReport';
import UserCharts from './Charts/UserCharts';
import PostByTimeCard from 'components/admin/GraphCards/PostsByTimeCard';
import ReactionsByTimeCard from 'components/admin/GraphCards/ReactionsByTimeCard';
import CommentsByTimeCard from 'components/admin/GraphCards/CommentsByTimeCard';

import { activeUsersByTimeCumulativeXlsxEndpoint } from 'api/active_users_by_time/util';
import usePhases from 'api/phases/usePhases';
import { useParams } from 'react-router-dom';
import useProjectById from 'api/projects/useProjectById';
import useIdeas from 'api/ideas/useIdeas';
import { ParticipationMethod } from 'api/phases/types';

const Section = styled.div`
  margin-bottom: 20px;
`;

const Phase = styled.div<{ isCurrentPhase: boolean }>`
  display: flex;
  margin-bottom: 20px;
  flex-direction: column;
  padding: 10px;
  border: ${(props) =>
    props.isCurrentPhase
      ? `solid 3px ${colors.borderDark}`
      : `solid 1px ${colors.borderLight}`};
  border-radius: ${(props) => props.theme.borderRadius};
`;

const RowSection = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 20px;
`;

const TimelineSection = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  margin: -24px 0 20px -24px;
  width: calc(100% + 24px);
  > * {
    margin: 24px 0 0 24px;
  }
`;

const PARTICIPATION_METHOD_MESSAGES: Record<
  ParticipationMethod,
  MessageDescriptor
> = {
  ideation: messages.ideationAndFeedback,
  information: messages.information,
  native_survey: messages.native_survey,
  survey: messages.survey,
  voting: messages.budgeting,
  poll: messages.poll,
  volunteering: messages.volunteering,
  document_annotation: messages.document_annotation,
};

const getResolution = (start: moment.Moment, end: moment.Moment) => {
  const timeDiff = moment.duration(end.diff(start));
  return timeDiff
    ? timeDiff.asMonths() > 6
      ? 'month'
      : timeDiff.asWeeks() > 4
      ? 'week'
      : 'day'
    : 'month';
};

const ProjectReport = () => {
  const { formatMessage, formatDate } = useIntl();
  const localize = useLocalize();
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: mostReactedIdeas } = useIdeas({
    'page[size]': 5,
    sort: 'popular',
    projects: [projectId],
  });

  // set time boundaries
  const [resolution, setResolution] = useState<IResolution>('month');
  const [startAt, setStartAt] = useState<string | null | undefined>(null);
  const [endAt, setEndAt] = useState<string | null>(null);

  useEffect(() => {
    if (isNilOrError(project)) return;

    if (!isNilOrError(phases) && phases.data.length > 0) {
      const startAt = phases.data[0].attributes.start_at;
      const endAt = phases.data[phases.data.length - 1].attributes.end_at;
      setStartAt(startAt);
      setEndAt(endAt);

      const resolution = getResolution(moment(startAt), moment(endAt));
      setResolution(resolution);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, phases]);

  if (isNilOrError(project)) return null;

  const formatDateLabel = (date: string) =>
    formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'short',
    });

  const mostReactedIdeasSerie = mostReactedIdeas?.data.map((idea) => ({
    code: idea.id,
    value: idea.attributes.likes_count + idea.attributes.dislikes_count,
    up: idea.attributes.likes_count,
    down: idea.attributes.dislikes_count,
    name: localize(idea.attributes.title_multiloc),
    slug: idea.attributes.slug,
  }));

  // deduplicated non-null participations methods in this project
  const participationMethods = (
    isNilOrError(phases)
      ? []
      : phases.data.map((phase) => phase.attributes.participation_method)
  ).filter((el, i, arr) => el && arr.indexOf(el) === i);

  const projectTitle = localize(project.data.attributes.title_multiloc);

  const timeBoundariesSet = !!(startAt && endAt);

  return (
    <>
      <RowSection>
        <PageTitle>
          <T value={project.data.attributes.title_multiloc} />
        </PageTitle>
        <ResolutionControl value={resolution} onChange={setResolution} />
      </RowSection>
      <Section>
        <TimelineSection>
          {!isNilOrError(phases) && phases.data.length > 0 ? (
            phases.data.map((phase, index) => {
              return (
                <Phase
                  key={index}
                  isCurrentPhase={
                    phase.id ===
                    project?.data.relationships?.current_phase?.data?.id
                  }
                >
                  {phase.attributes.end_at ? (
                    <p>
                      <FormattedMessage
                        {...messages.fromTo}
                        values={{
                          from: formatDateLabel(phase.attributes.start_at),
                          to: formatDateLabel(phase.attributes.end_at),
                        }}
                      />
                    </p>
                  ) : (
                    <p>
                      <FormattedMessage
                        {...messages.fromOnwards}
                        values={{
                          from: formatDateLabel(phase.attributes.start_at),
                        }}
                      />
                    </p>
                  )}
                  <FormattedMessage
                    {...PARTICIPATION_METHOD_MESSAGES[
                      phase.attributes.participation_method
                    ]}
                  />
                  <div>{localize(phase.attributes.title_multiloc)}</div>
                </Phase>
              );
            })
          ) : (
            <FormattedMessage {...messages.noPhase} />
          )}
        </TimelineSection>
      </Section>

      {!isEqual(participationMethods, ['information']) && timeBoundariesSet && (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.sectionWho} />
          </SectionTitle>
          <GraphsContainer>
            <BarChartActiveUsersByTime
              startAt={startAt}
              endAt={endAt}
              resolution={resolution}
              graphUnit="users"
              graphUnitMessageKey="users"
              graphTitle={formatMessage(messages.participantsOverTimeTitle)}
              xlsxEndpoint={activeUsersByTimeCumulativeXlsxEndpoint}
              currentProjectFilter={project.data.id}
              currentProjectFilterLabel={projectTitle}
            />
            <UserCharts
              startAt={startAt}
              endAt={endAt}
              participationMethods={participationMethods}
              project={project.data}
            />
          </GraphsContainer>
        </Section>
      )}

      <Section>
        {((participationMethods.includes('ideation') && timeBoundariesSet) ||
          participationMethods.includes('poll')) && (
          <SectionTitle>
            <FormattedMessage {...messages.sectionWhatInput} />
          </SectionTitle>
        )}
        {participationMethods.includes('ideation') && timeBoundariesSet && (
          <GraphsContainer>
            <Column>
              <PostByTimeCard
                projectId={projectId}
                startAtMoment={moment(startAt)}
                endAtMoment={moment(endAt)}
                resolution={resolution}
              />
              <ReactionsByTimeCard
                projectId={projectId}
                startAtMoment={moment(startAt)}
                endAtMoment={moment(endAt)}
                resolution={resolution}
              />
              <HorizontalBarChartWithoutStream
                serie={mostReactedIdeasSerie}
                graphTitleString={formatMessage(
                  messages.fiveInputsWithMostReactions
                )}
                graphUnit="reactions"
                className="dynamicHeight fullWidth"
              />
            </Column>
            <Column>
              <CommentsByTimeCard
                projectId={projectId}
                startAtMoment={moment(startAt)}
                endAtMoment={moment(endAt)}
                resolution={resolution}
              />
              <IdeasByStatusChart
                className="dynamicHeight fullWidth"
                startAt={startAt}
                endAt={endAt}
                currentProjectFilter={projectId}
              />
              <ParticipationPerTopic
                startAt={startAt}
                endAt={endAt}
                projectId={projectId}
                className="dynamicHeight fullWidth"
              />
            </Column>
          </GraphsContainer>
        )}
        {participationMethods.includes('poll') &&
          !isNilOrError(phases) &&
          phases.data.map(
            (phase) =>
              phase.attributes.participation_method === 'poll' && (
                <PollReport
                  key={phase.id}
                  phaseId={phase.id}
                  phaseTitle={localize(phase.attributes.title_multiloc)}
                />
              )
          )}
      </Section>
    </>
  );
};

export default ProjectReport;
