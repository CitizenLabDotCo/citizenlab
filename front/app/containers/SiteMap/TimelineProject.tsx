import React from 'react';
import { adopt } from 'react-adopt';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import { IProjectData } from 'services/projects';
// intl
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import messages from './messages';

interface InputProps {
  project: IProjectData;
}

interface DataProps {
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

const TimelineProject = ({ project, phases }: Props) => {
  if (!isNilOrError(phases)) {
    if (phases.length > 1) {
      return (
        <li>
          <FormattedMessage {...messages.timeline} />
          <ul>
            {phases.map((phase, i) => (
              <li key={phase.id}>
                <Link
                  to={{
                    pathname: `/projects/${project.attributes.slug}/${i + 1}`,
                  }}
                >
                  <T value={phase.attributes.title_multiloc} />
                </Link>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    if (phases.length === 1) {
      return (
        <li key={phases[0].id}>
          <Link to={{ pathname: `/projects/${project.attributes.slug}/1` }}>
            <T value={phases[0].attributes.title_multiloc} />
          </Link>
        </li>
      );
    }
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  phases: ({ project, render }) => (
    <GetPhases projectId={project.id}>{render}</GetPhases>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <TimelineProject {...inputProps} {...dataprops} />}
  </Data>
);
