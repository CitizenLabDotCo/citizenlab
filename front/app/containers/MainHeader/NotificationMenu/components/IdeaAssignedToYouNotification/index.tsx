import React, { MouseEvent, KeyboardEvent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaAssignedToYouNotificationData } from 'services/notifications';
import { get } from 'lodash-es';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

type DataProps = {
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
};

type InputProps = {
  notification: IIdeaAssignedToYouNotificationData;
};

type Props = DataProps & InputProps;

const IdeaAssignedToYouNotification = ({
  authUser,
  project,
  notification,
}: Props) => {
  const onClickUserName = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  const getNotificationMessage = (): JSX.Element => {
    const sharedValues = {
      postTitle: <T value={notification.attributes.post_title_multiloc} />,
    };

    if (isNilOrError(notification.attributes.initiating_user_slug)) {
      return (
        <FormattedMessage
          {...messages.postAssignedToYou}
          values={{
            ...sharedValues,
          }}
        />
      );
    } else {
      return (
        <FormattedMessage
          {...messages.xAssignedPostToYou}
          values={{
            ...sharedValues,
            name: (
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={onClickUserName}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>
            ),
          }}
        />
      );
    }
  };

  const getLinkTo = () => {
    if (authUser) {
      if (isAdmin({ data: authUser })) {
        return '/admin/ideas';
      } else if (
        !isNilOrError(project) &&
        isProjectModerator({ data: authUser })
      ) {
        return `/admin/projects/${project.id}/ideas`;
      }
    }

    return null;
  };

  const linkTo = getLinkTo();

  if (linkTo) {
    return (
      <NotificationWrapper
        linkTo={linkTo}
        timing={notification.attributes.created_at}
        icon="idea"
        isRead={!!notification.attributes.read_at}
      >
        {getNotificationMessage()}
      </NotificationWrapper>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  idea: ({ notification, render }) => (
    <GetIdea ideaSlug={notification?.attributes?.post_slug}>{render}</GetIdea>
  ),
  project: ({ idea, render }) => (
    <GetProject projectId={get(idea, 'relationships.project.data.id')}>
      {render}
    </GetProject>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <IdeaAssignedToYouNotification {...dataProps} {...inputProps} />
    )}
  </Data>
);
