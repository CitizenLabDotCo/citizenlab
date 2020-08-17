import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import withProfileLink from './withProfileLink';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// components
import Name from './Name';
import UnknownUser from './UnknownUser';

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

const UserName = (props: Props) => {
  const { user, className, linkToProfile, ...userNameProps } = props;

  if (!isNilOrError(user)) {
    const firstName = user.attributes.first_name;
    const lastName = user.attributes.last_name;

    const profileLink = `/profile/${user.attributes.slug}`;

    if (firstName) {
      // Sometimes we have a user, but names don't load (in dev mode)
      // Built in this check to make sure we don't show an empty space
      // See Name.tsx for why only firstName is required
      const NameComponent = (
        <Name
          firstName={firstName}
          lastName={lastName}
          className={className}
          {...userNameProps}
        />
      );

      return linkToProfile
        ? withProfileLink(NameComponent, profileLink, className)
        : NameComponent;
    }
  }

  return <UnknownUser className={className} />;
};

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <UserName {...inputProps} {...dataProps} />}
  </Data>
);
