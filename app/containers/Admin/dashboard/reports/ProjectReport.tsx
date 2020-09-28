import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import { isNilOrError } from 'utils/helperUtils';
import moment, { Moment } from 'moment';
import ResolutionControl from '../components/ResolutionControl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import styled, { ThemeProvider } from 'styled-components';

// libs
// import { map } from 'lodash-es';

// resources
import { IResolution, GraphsContainer, chartTheme } from '..';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
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
  // ideasByStatusXlsxEndpoint,
  // ideasByStatusStream,
  // IIdeasByStatus,
} from 'services/stats';
import { InjectedIntlProps } from 'react-intl';

// services
import { ParticipationMethod } from 'services/participationContexts';
import { IProjectData } from 'services/projects';

// components
import LineBarChart from '../summary/charts/LineBarChart';
import LineBarChartVotesByTime from '../summary/charts/LineBarChartVotesByTime';
// import HorizontalBarChart from '../users/charts/HorizontalBarChart';
import HorizontalBarChartWithoutStream from '../users/charts/HorizontalBarChartWithoutStream';
// import ExportMenu from '../components/ExportMenu';
// import { IPhase, IPhaseData, IPhases } from 'services/phases';
import { SectionTitle, PageTitle } from 'components/admin/Section';
import { IdeasByStatusChart } from '../components/IdeasByStatusChart';

const Section = styled.div`
  margin-bottom: 20px;
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
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const localize = useLocalize();

    const isTimelineProject = project.attributes.process_type === 'timeline';

    // set time boundaries
    const [resolution, setResolution] = useState<IResolution>('month');
    const [startAt, setStartAt] = useState<Moment | null | undefined>(null);
    const [endAt, setEndAt] = useState<Moment | null>(null);

    useEffect(() => {
      if (isTimelineProject) {
        if (!isNilOrError(phases) && phases.length > 0) {
          const startAt = phases[0].attributes.start_at;
          const endAt = phases[phases.length - 1].attributes.end_at;
          setStartAt(moment(startAt));
          setEndAt(moment(endAt));

          const resolution = getResolution(moment(startAt), moment(endAt));
          setResolution(resolution);
        }
      } else {
        const startAt = project.attributes.created_at;
        setStartAt(moment(startAt));
        setEndAt(moment());

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

    // deduplicated non-null participations methods in this project
    const participationMethods = (isTimelineProject
      ? isNilOrError(phases)
        ? []
        : phases.map((phase) => phase.attributes.participation_method)
      : [project.attributes.participation_method]
    ).filter(
      (el, i, arr) => el && arr.indexOf(el) === i
    ) as ParticipationMethod[];

    // if (!startAt || !endAt) {
    //   return null;
    // }

    const projectTitle = localize(project.attributes.title_multiloc);

    const mostVotedIdeasSerie = () => {
      if (!isNilOrError(mostVotedIdeas.list)) {
        const { list } = mostVotedIdeas;
        const serie = list.map((idea) => {
          return {
            code: idea.id,
            value:
              idea.attributes.upvotes_count + idea.attributes.downvotes_count,
            up: idea.attributes.upvotes_count,
            down: idea.attributes.downvotes_count,
            name: localize(idea.attributes.title_multiloc),
            slug: idea.attributes.slug,
          };
        });
        return serie.length > 0 ? serie : null;
      }
      return null;
    };

    return (
      <>
        <RowSection>
          <PageTitle>{projectTitle}</PageTitle>
          <ResolutionControl value={resolution} onChange={setResolution} />
        </RowSection>
        <Section>
          <SectionTitle>
            Project Type :{' '}
            {isTimelineProject ? 'Timeline Project' : 'Continuous'}
          </SectionTitle>
        </Section>

        {isTimelineProject ? (
          <TimelineSection>
            {!isNilOrError(phases) && phases.length > 0
              ? phases.map((phase, index) => {
                  return (
                    <Section key={index}>
                      <p>
                        from {phase.attributes.start_at} to{' '}
                        {phase.attributes.end_at}
                      </p>
                      <div>{phase.attributes.participation_method}</div>
                      <div>{localize(phase.attributes.title_multiloc)}</div>
                    </Section>
                  );
                })
              : 'No configured phase'}
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
                startAt={startAt.toISOString()}
                endAt={endAt.toISOString()}
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
                  startAt={startAt.toISOString()}
                  endAt={endAt.toISOString()}
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
                  startAt={startAt.toISOString()}
                  endAt={endAt.toISOString()}
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
                  startAt={startAt.toISOString()}
                  endAt={endAt.toISOString()}
                  resolution={resolution}
                  currentProjectFilter={project.id}
                  currentProjectFilterLabel={projectTitle}
                />

                <IdeasByStatusChart
                  className="fullWidth dynamicHeight"
                  startAt={startAt.toISOString()}
                  endAt={endAt.toISOString()}
                  currentProjectFilter={project.id}
                />

                <HorizontalBarChartWithoutStream
                  serie={mostVotedIdeasSerie()}
                  graphTitleString={formatMessage(
                    messages.fiveIdeasWithMostVotes
                  )}
                  graphUnit="votes"
                  className="dynamicHeight"
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
