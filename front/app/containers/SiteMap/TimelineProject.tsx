import React from 'react';

import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

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
      <li key={phases.data[0].id}>
        <Link to={{ pathname: `/projects/${project.attributes.slug}/1` }}>
          <T value={phases.data[0].attributes.title_multiloc} />
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
