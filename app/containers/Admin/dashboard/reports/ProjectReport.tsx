import React, { memo, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';
import { IProjectData } from 'services/projects';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import { SectionTitle, PageTitle } from 'components/admin/Section';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import ResolutionControl from '../components/ResolutionControl';
import { IResolution } from '..';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';

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
  const [startAt, setStartAt] = useState<string>();
  const [endAt, setEndAt] = useState<string>();

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

  return (
    <>
      <PageTitle>{localize(project.attributes.title_multiloc)}</PageTitle>
      <Section>
        <ResolutionControl value={resolution} onChange={setResolution} />

        {timelineProject && 'Project Timeline'}
      </Section>

      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.sectionWho} />
        </SectionTitle>
      </Section>
    </>
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
