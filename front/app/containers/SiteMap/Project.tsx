import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { H3, H4 } from './';
import T from 'components/T';
import Link from 'utils/cl-router/Link';

// components
import ContinuousProject from './ContinuousProject';
import TimelineProject from './TimelineProject';

// hooks
import useEvents from 'api/events/useEvents';
import useProjectById from 'api/projects/useProjectById';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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
          {project.data.attributes.process_type === 'continuous' ? (
            <ContinuousProject key={project.data.id} project={project.data} />
          ) : (
            <TimelineProject key={project.data.id} project={project.data} />
          )}
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
