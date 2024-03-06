import React from 'react';

import useEvents from 'api/events/useEvents';
import useProjectById from 'api/projects/useProjectById';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import TimelineProject from './TimelineProject';

import { H3, H4 } from './';

interface Props {
  projectId: string;
  hightestTitle: 'h3' | 'h4';
}

const Project = ({ projectId, hightestTitle }: Props) => {
  const { data: events } = useEvents({
    projectIds: [projectId],
  });
  const { data: project } = useProjectById(projectId);

  const TitleComponent = { h3: H3, h4: H4 }[hightestTitle];

  if (!isNilOrError(project)) {
    return (
      <>
        <TitleComponent>
          <T value={project.data.attributes.title_multiloc} />
        </TitleComponent>
        <ul>
          <li>
            <Link to={`/projects/${project.data.attributes.slug}`}>
              <FormattedMessage {...messages.projectInfo} />
            </Link>
          </li>
          <TimelineProject key={project.data.id} project={project.data} />

          {!isNilOrError(events) && events.data.length > 0 && (
            <li>
              <Link to={`/projects/${project.data.attributes.slug}/events`}>
                <FormattedMessage {...messages.projectEvents} />
              </Link>
            </li>
          )}
        </ul>
      </>
    );
  }

  return null;
};

export default Project;
