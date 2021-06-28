import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { H3, H4 } from './';
import T from 'components/T';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';
import Link from 'utils/cl-router/Link';

import ContinuousProject from './ContinuousProject';
import TimelineProject from './TimelineProject';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

interface InputProps {
  adminPublication: IAdminPublicationContent;
  hightestTitle: 'h3' | 'h4';
}
interface DataProps {
  events: GetEventsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const Project = ({
  adminPublication,
  hightestTitle,
  events,
  project,
}: Props) => {
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

const Data = adopt<DataProps, InputProps>({
  project: ({ adminPublication, render }) => (
    <GetProject projectId={adminPublication.publicationId}>{render}</GetProject>
  ),
  events: ({ adminPublication, render }) => (
    <GetEvents projectIds={[adminPublication.publicationId]}>
      {render}
    </GetEvents>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <Project {...inputProps} {...dataprops} />}
  </Data>
);
