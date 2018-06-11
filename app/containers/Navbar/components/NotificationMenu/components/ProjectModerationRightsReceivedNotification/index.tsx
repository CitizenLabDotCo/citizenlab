import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectModerationRightsReceivedNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { Link } from 'react-router';

interface InputProps {
  notification: IProjectModerationRightsReceivedNotificationData;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

type State = {};

class ProjectModerationRightsReceivedNotification extends React.PureComponent<Props, State> {

  handleOnClickProject = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification, project } = this.props;

    if (isNilOrError(project)) return null;

    return (
      <NotificationWrapper
        linkTo={`/admin/projects/${project.id}/edit`}
        timing={notification.attributes.created_at}
        icon="admin"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.projectModerationRightsReceived}
          values={{
            projectLink:
              <Link
                to={`/projects/${project.attributes.slug}`}
                onClick={this.handleOnClickProject}
              >
                <T value={project.attributes.title_multiloc} />
              </Link>,
          }}
        />
      </NotificationWrapper>
    );
  }
}

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.project.data) return null;

  return (
    <GetProject id={notification.relationships.project.data.id}>
      {project => <ProjectModerationRightsReceivedNotification notification={notification} project={project} />}
    </GetProject>
  );
};
