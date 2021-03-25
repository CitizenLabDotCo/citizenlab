import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { IProjectData } from 'services/projects';
import Link from 'utils/cl-router/Link';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import T from 'components/T';

// intl
import { FormattedMessage } from 'utils/cl-intl';
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
            {phases.map((phase) => (
              <li key={phase.id}>
                <Link
                  to={{
                    pathname: `/projects/${project.attributes.slug}/process`,
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
          <Link
            to={{ pathname: `/projects/${project.attributes.slug}/process` }}
          >
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
