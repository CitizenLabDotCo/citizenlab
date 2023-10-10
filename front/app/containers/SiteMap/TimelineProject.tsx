import React from 'react';
import { IProjectData } from 'api/projects/types';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import usePhases from 'api/phases/usePhases';

interface Props {
  project: IProjectData;
}

const TimelineProject = ({ project }: Props) => {
  const { data: phases } = usePhases(project.id);

  if (!phases || phases.data.length === 0) {
    return null;
  }

  if (phases.data.length === 1) {
    return (
      <li key={phases[0].id}>
        <Link to={{ pathname: `/projects/${project.attributes.slug}/1` }}>
          <T value={phases[0].attributes.title_multiloc} />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <FormattedMessage {...messages.timeline} />
      <ul>
        {phases.data.map((phase, i) => (
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
};

export default TimelineProject;
