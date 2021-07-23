import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { H3, H4 } from './';
import T from 'components/T';
import Link from 'utils/cl-router/Link';

// components
import ContinuousProject from './ContinuousProject';
import TimelineProject from './TimelineProject';

// hooks
import useEvents from 'hooks/useEvents';
import useProject from 'hooks/useProject';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

interface Props {
  adminPublication: IAdminPublicationContent;
  hightestTitle: 'h3' | 'h4';
}

export default ({ adminPublication, hightestTitle }: Props) => {
  const projectId = adminPublication.publicationId;
  const { events } = useEvents({
    projectIds: [projectId],
  });
  const project = useProject({ projectId });

  const TitleComponent = hightestTitle === 'h3' ? H3 : H4;

  return (
    <>
      <TitleComponent>
        <T value={adminPublication.attributes.publication_title_multiloc} />
      </TitleComponent>
      <ul>
        <li>
          <Link
            to={`/projects/${adminPublication.attributes.publication_slug}/info`}
          >
            <FormattedMessage {...messages.projectInfo} />
          </Link>
        </li>
        {!isNilOrError(project) && (
          <>
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
          </>
        )}
      </ul>
    </>
  );
};
