import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';

// resources
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import messages from './messages';
import { IResolution, GraphsContainer } from '..';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import {
  usersByTimeCumulativeXlsxEndpoint,
  usersByTimeCumulativeStream,
  usersByTimeStream,
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
import { IProjectData } from 'services/projects';

// components
import LineBarChart from '../summary/charts/LineBarChart';
import LineBarChartVotesByTime from '../summary/charts/LineBarChartVotesByTime';

import HorizontalBarChartWithoutStream from '../users/charts/HorizontalBarChartWithoutStream';
import { SectionTitle, PageTitle } from 'components/admin/Section';
import IdeasByStatusChart from '../components/IdeasByStatusChart';
import ParticipationPerTopic from './charts/ParticipationPerTopic';
import ResolutionControl from '../components/ResolutionControl';
import T from 'components/T';

const Section = styled.div`
  margin-bottom: 20px;
`;

const Phase = styled.div`
  display: flex;
  margin-bottom: 20px;
  flex-direction: column;
  padding: 10px;
  border: solid 1px ${colors.adminBorder};
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.adminContentBackground};
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

interface InputProps {
  project: IProjectData;
}
interface DataProps {
  phases: GetPhasesChildProps;
  mostVotedIdeas: GetIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectReport = memo(
  ({
    project,
    phases,
    mostVotedIdeas,
    intl: { formatMessage, formatDate },
  }: Props & InjectedIntlProps) => {
    const localize = useLocalize();

    const isTimelineProject = project.attributes.process_type === 'timeline';

    // set time boundaries
    const [resolution, setResolution] = useState<IResolution>('month');
    const [startAt, setStartAt] = useState<string | null | undefined>(null);
    const [endAt, setEndAt] = useState<string | null>(null);

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
    }, [project, phases]);

    const getResolution = (start, end) => {
      const timeDiff = moment.duration(start.diff(end));
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

    // if ((!startAt || !endAt)) {
    //   return null; // TODO add better test? and good empty state. If there's no phase or no participants, let's not show empty sections.
    // }

    const projectTitle = localize(project.attributes.title_multiloc);

    return (
      <>
        <RowSection>
          <PageTitle>
            <T value={project.attributes.title_multiloc} />
          </PageTitle>
          <ResolutionControl value={resolution} onChange={setResolution} />
        </RowSection>
        <Section>
          <SectionTitle>
            <FormattedMessage
              {...messages.projectType}
              values={{
                projectType: isTimelineProject ? (
                  <FormattedMessage {...messages.timelineType} />
                ) : (
                  <FormattedMessage {...messages.continuousType} />
                ),
              }}
            />
          </SectionTitle>
        </Section>

        {isTimelineProject ? (
          <TimelineSection>
            {!isNilOrError(phases) && phases.length > 0 ? (
              phases.map((phase, index) => {
                return (
                  <Phase key={index}>
                    <p>
                      <FormattedMessage
                        {...messages.fromTo}
                        values={{
                          from: formatDateLabel(phase.attributes.start_at),
                          to: formatDateLabel(phase.attributes.end_at),
                        }}
                      />
                    </p>
                    <div>{phase.attributes.participation_method}</div>
                    <div>{localize(phase.attributes.title_multiloc)}</div>
                  </Phase>
                );
              })
            ) : (
              <FormattedMessage {...messages.noPhase} />
            )}
          </TimelineSection>
        ) : (
          <Section>
            <p>Created on {startAt}</p>
            <div>{project.attributes.participation_method}</div>
          </Section>
        )}

        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.sectionWho} />
          </SectionTitle>
          <GraphsContainer>
            {participationMethods !== ['information'] && startAt && endAt && (
              <LineBarChart
                graphTitle={formatMessage(messages.participantsOverTimeTitle)}
                xlsxEndpoint={usersByTimeCumulativeXlsxEndpoint}
                graphUnit="users"
                graphUnitMessageKey="users"
                startAt={startAt}
                endAt={endAt}
                barStream={usersByTimeStream}
                lineStream={usersByTimeCumulativeStream}
                resolution={resolution}
                currentProjectFilter={project.id}
                currentProjectFilterLabel={projectTitle}
              />
            )}
          </GraphsContainer>
        </Section>
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.sectionWhat} />
          </SectionTitle>
          <GraphsContainer>
            {participationMethods.includes('ideation') && startAt && endAt && (
              <>
                <LineBarChart
                  graphTitle={formatMessage(messages.ideasByTimeTitle)}
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
                  className="fullWidth dynamicHeight"
                  startAt={startAt}
                  endAt={endAt}
                  currentProjectFilter={project.id}
                />

                <HorizontalBarChartWithoutStream
                  serie={mostVotedIdeasSerie}
                  graphTitleString={formatMessage(
                    messages.fiveIdeasWithMostVotes
                  )}
                  graphUnit="votes"
                  className="dynamicHeight"
                />
                <ParticipationPerTopic
                  startAt={startAt}
                  endAt={endAt}
                  projectId={project.id}
                />
              </>
            )}
          </GraphsContainer>
        </Section>
      </>
    );
  }
);

const ProjectReportWithHoc = injectIntl(ProjectReport);

const Data = adopt<DataProps, InputProps>({
  phases: ({ project, render }) => (
    <GetPhases projectId={project.id}>{render}</GetPhases>
  ),
  mostVotedIdeas: ({ project, render }) => (
    <GetIdeas
      pageNumber={1}
      pageSize={5}
      sort="popular"
      type="paginated"
      projectIds={[project.id]}
    >
      {render}
    </GetIdeas>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectReportWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
