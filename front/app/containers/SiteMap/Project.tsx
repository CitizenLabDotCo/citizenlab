import React from 'react';
// hooks
import useEvents from 'hooks/useEvents';
import useProject from 'hooks/useProject';
// intl
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { H3, H4 } from './';
// components
import ContinuousProject from './ContinuousProject';
import TimelineProject from './TimelineProject';
import messages from './messages';

interface Props {
  projectId: string;
  hightestTitle: 'h3' | 'h4';
}

const Project = ({ projectId, hightestTitle }: Props) => {
  const { events } = useEvents({
    projectIds: [projectId],
  });
  const project = useProject({ projectId });

  const TitleComponent = { h3: H3, h4: H4 }[hightestTitle];

  if (!isNilOrError(project)) {
    return (
      <>
        <TitleComponent>
          <T value={project.attributes.title_multiloc} />
        </TitleComponent>
        <ul>
          <li>
            <Link to={`/projects/${project.attributes.slug}`}>
              <FormattedMessage {...messages.projectInfo} />
            </Link>
          </li>
          {project.attributes.process_type === 'continuous' ? (
            <ContinuousProject key={project.id} project={project} />
          ) : (
            <TimelineProject key={project.id} project={project} />
          )}
          {!isNilOrError(events) && events.length > 0 && (
            <li>
              <Link to={`/projects/${project.attributes.slug}/events`}>
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
