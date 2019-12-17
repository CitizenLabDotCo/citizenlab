import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';
import { H3, H4 } from './';
import T from 'components/T';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';
import Link  from 'utils/cl-router/Link';

import ContinuousProject from './ContinuousProject';
import TimelineProject from './TimelineProject';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface InputProps {
  project: IProjectData;
  hightestTitle: 'h3' | 'h4';
}
interface DataProps {
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps { }

const Project = ({ project, hightestTitle, events }: Props) => {
  const TitleComponent = hightestTitle === 'h3' ? H3 : H4;
  return (
    <>
      <TitleComponent>
        <T value={project.attributes.title_multiloc} />
      </TitleComponent>
      <ul>
        <li>
          <Link to={`/projects/${project.attributes.slug}/info`}>
            <FormattedMessage {...messages.projectInfo} />
          </Link>
        </li>
        {project.attributes.process_type === 'continuous'
          ? <ContinuousProject key={project.id} project={project} />
          : <TimelineProject key={project.id} project={project} />
        }
        {!isNilOrError(events) && events.length > 0 && (
          <li>
            <Link to={`/projects/${project.attributes.slug}/events`}>
              <FormattedMessage {...messages.projectEvents}/>
            </Link>
          </li>
        )}
      </ul>
    </>
  );
};

const Data = adopt<DataProps, InputProps>({
  events: ({ project, render }) => <GetEvents projectId={project.id}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <Project {...inputProps} {...dataprops} />}
  </Data>
);
