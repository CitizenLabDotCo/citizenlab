import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';

// resources
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import messages from '../messages';
import { IResolution, GraphsContainer } from '..';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetUserCustomFields, {
  GetUserCustomFieldsChildProps,
} from 'resources/GetUserCustomFields';
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
import CustomFieldComparison from './CustomFieldComparison';
import BarChartActiveUsersByTime from '../summary/charts/BarChartActiveUsersByTime';

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

interface InputProps {
  project: IProjectData;
}
interface DataProps {
  phases: GetPhasesChildProps;
  mostVotedIdeas: GetIdeasChildProps;
  customFields: GetUserCustomFieldsChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectReport = memo(
  ({
    project,
    phases,
    mostVotedIdeas,
    customFields,
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
              {participationMethods !== ['information'] &&
                startAt &&
                endAt &&
                !isNilOrError(customFields) &&
                customFields.map(
                  (customField) =>
                    // only show enabled fields, only supported number field is birthyear.
                    customField.attributes.enabled &&
                    (customField.attributes.input_type === 'number'
                      ? customField.attributes.code === 'birthyear'
                      : true) && (
                      <CustomFieldComparison
                        customField={customField}
                        currentProject={project.id}
                        key={customField.id}
                      />
                    )
                )}
            </GraphsContainer>
          </Section>
        )}

        {participationMethods.includes('ideation') && startAt && endAt && (
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.sectionWhatInput} />
            </SectionTitle>
            <GraphsContainer>
              <>
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
              </>
            </GraphsContainer>
          </Section>
        )}
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
  customFields: (
    <GetUserCustomFields
      inputTypes={['select', 'multiselect', 'checkbox', 'number']}
    />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectReportWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
