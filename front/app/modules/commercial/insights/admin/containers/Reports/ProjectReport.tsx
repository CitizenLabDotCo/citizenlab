import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';

// resources
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import messages from './messages';
import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';
import { GraphsContainer } from 'components/admin/Chart';

import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import {
  activeUsersByTimeCumulativeXlsxEndpoint,
  activeUsersByTimeStream,
  ideasByTimeCumulativeXlsxEndpoint,
  ideasByTimeCumulativeStream,
  ideasByTimeStream,
  commentsByTimeCumulativeXlsxEndpoint,
  commentsByTimeCumulativeStream,
  commentsByTimeStream,
} from 'services/stats';
import { InjectedIntlProps } from 'react-intl';
import { colors } from 'utils/styleUtils';

// services
import { ParticipationMethod } from 'services/participationContexts';

// components
import { SectionTitle, PageTitle } from 'components/admin/Section';
import T from 'components/T';

import HorizontalBarChartWithoutStream from './charts/HorizontalBarChartWithoutStream';
import IdeasByStatusChart from './charts/IdeasByStatusChart';
import ParticipationPerTopic from './charts/ParticipationPerTopic';
import LineBarChart from './charts/LineBarChart';
import LineBarChartVotesByTime from './charts/LineBarChartVotesByTime';
import BarChartActiveUsersByTime from './charts/BarChartActiveUsersByTime';
import PollReport from './PollReport';

import Outlet from 'components/Outlet';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { withRouter, WithRouterProps } from 'react-router';

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
      ? `solid 3px ${colors.border}`
      : `solid 1px ${colors.adminBorder}`};
  border-radius: ${(props: any) => props.theme.borderRadius};
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

interface Props {
  phases: GetPhasesChildProps;
  mostVotedIdeas: GetIdeasChildProps;
  project: GetProjectChildProps;
}

const ProjectReport = memo(
  ({
    project,
    phases,
    mostVotedIdeas,
    intl: { formatMessage, formatDate },
  }: Props & InjectedIntlProps & WithRouterProps) => {
    if (isNilOrError(project)) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const localize = useLocalize();

    const isTimelineProject = project.attributes.process_type === 'timeline';

    // set time boundaries
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [resolution, setResolution] = useState<IResolution>('month');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [startAt, setStartAt] = useState<string | null | undefined>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [endAt, setEndAt] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (isTimelineProject) {
        if (!isNilOrError(phases) && phases.length > 0) {
          const startAt = phases[0].attributes.start_at;
          const endAt = phases[phases.length - 1].attributes.end_at;
          setStartAt(startAt);
          setEndAt(endAt);

          const resolution = getResolution(moment(startAt), moment(endAt));
          setResolution(resolution);
        }
      } else {
        const startAt = project.attributes.created_at;
        setStartAt(startAt);
        setEndAt(moment().toISOString());

        const resolution = getResolution(moment(startAt), moment());
        setResolution(resolution);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, phases]);

    const getResolution = (start, end) => {
      const timeDiff = moment.duration(end.diff(start));
      return timeDiff
        ? timeDiff.asMonths() > 6
          ? 'month'
          : timeDiff.asWeeks() > 4
          ? 'week'
          : 'day'
        : 'month';
    };

    const formatDateLabel = (date) =>
      formatDate(date, {
        day: resolution === 'month' ? undefined : '2-digit',
        month: 'short',
      });

    const mostVotedIdeasSerie = mostVotedIdeas?.list?.map((idea) => ({
      code: idea.id,
      value: idea.attributes.upvotes_count + idea.attributes.downvotes_count,
      up: idea.attributes.upvotes_count,
      down: idea.attributes.downvotes_count,
      name: localize(idea.attributes.title_multiloc),
      slug: idea.attributes.slug,
    }));

    // deduplicated non-null participations methods in this project
    const participationMethods = (isTimelineProject
      ? isNilOrError(phases)
        ? []
        : phases.map((phase) => phase.attributes.participation_method)
      : [project.attributes.participation_method]
    ).filter(
      (el, i, arr) => el && arr.indexOf(el) === i
    ) as ParticipationMethod[];

    const projectTitle = localize(project.attributes.title_multiloc);
    const participationMethodMessages: {
      [key in ParticipationMethod]: ReactIntl.FormattedMessage.MessageDescriptor;
    } = {
      ideation: messages.ideationAndFeedback,
      information: messages.information,
      survey: messages.survey,
      budgeting: messages.budgeting,
      poll: messages.poll,
      volunteering: messages.volunteering,
    };

    return (
      <>
        <RowSection>
          <PageTitle>
            <T value={project.attributes.title_multiloc} />
          </PageTitle>
          <ResolutionControl value={resolution} onChange={setResolution} />
        </RowSection>
        {isTimelineProject && (
          <Section>
            <TimelineSection>
              {!isNilOrError(phases) && phases.length > 0 ? (
                phases.map((phase, index) => {
                  return (
                    <Phase
                      key={index}
                      isCurrentPhase={
                        phase.id ===
                        project?.relationships?.current_phase?.data?.id
                      }
                    >
                      <p>
                        <FormattedMessage
                          {...messages.fromTo}
                          values={{
                            from: formatDateLabel(phase.attributes.start_at),
                            to: formatDateLabel(phase.attributes.end_at),
                          }}
                        />
                      </p>
                      <FormattedMessage
                        {...participationMethodMessages[
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
        )}

        {participationMethods !== ['information'] && startAt && endAt && (
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.sectionWho} />
            </SectionTitle>
            <GraphsContainer>
              <BarChartActiveUsersByTime
                startAt={startAt}
                endAt={endAt}
                stream={activeUsersByTimeStream}
                resolution={resolution}
                graphUnit="users"
                graphUnitMessageKey="users"
                graphTitle={formatMessage(messages.participantsOverTimeTitle)}
                xlsxEndpoint={activeUsersByTimeCumulativeXlsxEndpoint}
                currentProjectFilter={project.id}
                currentProjectFilterLabel={projectTitle}
              />
              <Outlet
                id="app.containers.Admin.dashboard.reports.ProjectReport.graphs"
                startAt={startAt}
                endAt={endAt}
                participationMethods={participationMethods}
                project={project}
              />
            </GraphsContainer>
          </Section>
        )}

        <Section>
          {((participationMethods.includes('ideation') && startAt && endAt) ||
            participationMethods.includes('poll')) && (
            <SectionTitle>
              <FormattedMessage {...messages.sectionWhatInput} />
            </SectionTitle>
          )}
          {participationMethods.includes('ideation') && startAt && endAt && (
            <GraphsContainer>
              <LineBarChart
                graphTitle={formatMessage(messages.inputs)}
                graphUnit="ideas"
                graphUnitMessageKey="ideas"
                startAt={startAt}
                endAt={endAt}
                resolution={resolution}
                currentProjectFilter={project.id}
                currentProjectFilterLabel={projectTitle}
                xlsxEndpoint={ideasByTimeCumulativeXlsxEndpoint}
                className="e2e-ideas-chart"
                lineStream={ideasByTimeCumulativeStream}
                barStream={ideasByTimeStream}
              />
              <LineBarChart
                graphTitle={formatMessage(messages.commentsByTimeTitle)}
                graphUnit="comments"
                graphUnitMessageKey="comments"
                startAt={startAt}
                endAt={endAt}
                resolution={resolution}
                currentProjectFilter={project.id}
                currentProjectFilterLabel={projectTitle}
                xlsxEndpoint={commentsByTimeCumulativeXlsxEndpoint}
                className="e2e-comments-chart"
                lineStream={commentsByTimeCumulativeStream}
                barStream={commentsByTimeStream}
              />

              <LineBarChartVotesByTime
                className="e2e-votes-chart"
                startAt={startAt}
                endAt={endAt}
                resolution={resolution}
                currentProjectFilter={project.id}
                currentProjectFilterLabel={projectTitle}
              />

              <IdeasByStatusChart
                className="dynamicHeight"
                startAt={startAt}
                endAt={endAt}
                currentProjectFilter={project.id}
              />

              <HorizontalBarChartWithoutStream
                serie={mostVotedIdeasSerie}
                graphTitleString={formatMessage(
                  messages.fiveInputsWithMostVotes
                )}
                graphUnit="votes"
                className="dynamicHeight"
              />
              <ParticipationPerTopic
                startAt={startAt}
                endAt={endAt}
                projectId={project.id}
                className="dynamicHeight"
              />
            </GraphsContainer>
          )}
          {participationMethods.includes('poll') ? (
            isTimelineProject ? (
              !isNilOrError(phases) &&
              phases.map(
                (phase) =>
                  phase.attributes.participation_method === 'poll' && (
                    <PollReport
                      key={phase.id}
                      participationContextType="phase"
                      participationContextId={phase.id}
                      participationContextTitle={localize(
                        phase.attributes.title_multiloc
                      )}
                    />
                  )
              )
            ) : (
              <PollReport
                participationContextType="project"
                participationContextId={project.id}
                participationContextTitle={localize(
                  project.attributes.title_multiloc
                )}
              />
            )
          ) : null}
        </Section>
      </>
    );
  }
);

const ProjectReportWithHoc = injectIntl(ProjectReport);

const Data = adopt<Props, WithRouterProps>({
  phases: ({ params, render }) => (
    <GetPhases projectId={params.projectId}>{render}</GetPhases>
  ),
  mostVotedIdeas: ({ params, render }) => (
    <GetIdeas
      pageNumber={1}
      pageSize={5}
      sort="popular"
      type="paginated"
      projectIds={[params.projectId]}
    >
      {render}
    </GetIdeas>
  ),
  project: ({ params, render }) => (
    <GetProject projectId={params.projectId}>{render}</GetProject>
  ),
});

export default withRouter((inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectReportWithHoc {...inputProps} {...dataProps} />}
  </Data>
));
