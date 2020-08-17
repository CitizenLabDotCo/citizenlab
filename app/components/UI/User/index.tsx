import React from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import withProfileLink from './withProfileLink';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// components
import UserName from './UserName';
import DeletedUser from './DeletedUser';

interface DataProps {
  user: GetUserChildProps;
}

interface UserNameProps {
  hideLastName?: boolean;
  emphasize?: boolean;
  color?: string;
  canModerate?: boolean;
}

interface InputProps extends UserNameProps {
  // if user was deleted, userId can be null
  userId: string | null;
  className?: string;
  linkToProfile?: boolean;
}

interface Props extends InputProps, DataProps {}

const User = (props: Props) => {
  const { user, className, linkToProfile, ...userNameProps } = props;

  if (!isNilOrError(user)) {
    const firstName = get(user, 'attributes.first_name', '');
    const lastName = get(user, 'attributes.last_name', '');
    const profileLink = `/profile/${user.attributes.slug}`;

    const Component = (
      <UserName
        firstName={firstName}
        lastName={lastName}
        className={className}
        {...userNameProps}
      />
    );

    return linkToProfile
      ? withProfileLink(Component, profileLink, className)
      : Component;
  }

  return <DeletedUser className={className} />;
};

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <User {...inputProps} {...dataProps} />}
  </Data>
);
