import React from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// resources
import { IProjectModerationRightsReceivedNotificationData } from 'services/notifications';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';

interface InputProps {
  notification: IProjectModerationRightsReceivedNotificationData;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

class ProjectModerationRightsReceivedNotification extends React.PureComponent<Props> {
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
                onClick={stopPropagation}
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
