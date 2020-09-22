import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';
import { IProjectData } from 'services/projects';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import { SectionTitle, PageTitle } from 'components/admin/Section';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import ResolutionControl from '../components/ResolutionControl';
import { IResolution, GraphsContainer, chartTheme } from '..';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled, { ThemeProvider } from 'styled-components';
import { ParticipationMethod } from 'services/participationContexts';
import CumulativeAreaChart from '../summary/charts/CumulativeAreaChart';
import {
  usersByTimeCumulativeXlsxEndpoint,
  usersByTimeCumulativeStream,
} from 'services/stats';

interface InputProps {
  project: IProjectData;
}
interface DataProps {
  phases: GetPhasesChildProps;
}

const Section = styled.div`
  margin-bottom: 20px;
`;

interface Props extends InputProps, DataProps {}

const ProjectReport = memo(({ project, phases }: Props) => {
  const localize = useLocalize();

  const timelineProject = project.attributes.process_type === 'timeline';

  // set time boundaries
  const [resolution, setResolution] = useState<IResolution>('month');
  const [startAt, setStartAt] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<string | null>(null);

  useEffect(() => {
    if (timelineProject) {
      if (!isNilOrError(phases)) {
        const startAt = phases[0].attributes.start_at;
        const endAt = phases[phases.length - 1].attributes.end_at;
        setStartAt(startAt);
        setEndAt(endAt);

        const timeDiff = moment.duration(moment(endAt).diff(moment(startAt)));
        setResolution(
          timeDiff
            ? timeDiff.asMonths() > 6
              ? 'month'
              : timeDiff.asWeeks() > 4
              ? 'week'
              : 'day'
            : 'month'
        );
      }
    } else {
      const startAt = project.attributes.created_at;
      setStartAt(startAt);
      setEndAt(moment().toISOString());

      const timeDiff = moment.duration(moment().diff(moment(startAt)));
      setResolution(
        timeDiff
          ? timeDiff.asMonths() > 6
            ? 'month'
            : timeDiff.asWeeks() > 4
            ? 'week'
            : 'day'
          : 'month'
      );
    }
  }, [project, phases]);

  // deduplicated non-null participations methods in this project
  const participationMethods = (timelineProject
    ? isNilOrError(phases)
      ? []
      : phases.map((phase) => phase.attributes.participation_method)
    : [project.attributes.participation_method]
  ).filter(
    (el, i, arr) => el && arr.indexOf(el) === i
  ) as ParticipationMethod[];

  if (!startAt || !endAt) {
    return null;
  }

  const projectTitle = localize(project.attributes.title_multiloc);

  return (
    <ThemeProvider theme={chartTheme}>
      <PageTitle>{projectTitle}</PageTitle>
      <Section>
        <ResolutionControl value={resolution} onChange={setResolution} />

        {timelineProject && 'Project Timeline'}
      </Section>

      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.sectionWho} />
        </SectionTitle>
        <GraphsContainer>
          {participationMethods !== ['information'] && (
            <CumulativeAreaChart
              graphTitleMessageKey="usersByTimeTitle"
              xlsxEndpoint={usersByTimeCumulativeXlsxEndpoint}
              graphUnit="users"
              startAt={startAt}
              endAt={endAt}
              stream={usersByTimeCumulativeStream}
              className="e2e-users-by-time-cumulative-chart"
              resolution={resolution}
              currentGroupFilter={undefined}
              currentTopicFilter={undefined}
              currentGroupFilterLabel={undefined}
              currentTopicFilterLabel={undefined}
              currentProjectFilter={project.id}
              currentProjectFilterLabel={projectTitle}
            />
          )}
        </GraphsContainer>
      </Section>
    </ThemeProvider>
  );
});

const Data = adopt<DataProps, InputProps>({
  phases: ({ project, render }) => (
    <GetPhases projectId={project.id}>{render}</GetPhases>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectReport {...inputProps} {...dataProps} />}
  </Data>
);
