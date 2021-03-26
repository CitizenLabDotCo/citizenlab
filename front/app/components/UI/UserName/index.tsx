import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// components
import Name from './Name';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface DataProps {
  user: GetUserChildProps;
}

interface StyleProps {
  fontWeight?: number;
  fontSize?: number;
  underline?: boolean;
  color?: string;
  canModerate?: boolean;
}

interface InputProps extends StyleProps {
  // if user was deleted, userId can be null
  userId: string | null;
  className?: string;
  isLinkToProfile?: boolean;
  hideLastName?: boolean;
}

interface Props extends InputProps, DataProps {}

const UserName = (props: Props & InjectedIntlProps) => {
  const {
    intl: { formatMessage },
    user,
    className,
    isLinkToProfile,
    hideLastName,
    ...styleProps
  } = props;
  let isUnknownUser = false;

  const getName = () => {
    if (!isNilOrError(user)) {
      const firstName = user.attributes.first_name;
      const lastName = user.attributes.last_name;
      if (firstName) {
        // Sometimes we have a user, but names don't load (only seen in dev mode)
        // Built in this check to make sure we don't show an empty space (in production)
        // See Name.tsx for why only firstName is required
        return `${firstName} ${!hideLastName && lastName ? lastName : ''}`;
      }
    }

    isUnknownUser = true;
    return formatMessage(messages.deletedUser);
  };

  const getProfileLink = () => {
    if (
      !isNilOrError(user) &&
      // It only makes sense to link to profile when we see a name,
      // we don't want to link to the profile of an unknown user
      user.attributes.first_name &&
      user.attributes.slug
    ) {
      return `/profile/${user.attributes.slug}`;
    }

    return null;
  };

  const name = getName();
  const profileLink = getProfileLink();

  const NameComponent = (
    <Name
      name={name}
      className={className}
      isUnknownUser={isUnknownUser || isNilOrError(user)}
      isLinkToProfile={isLinkToProfile}
      {...styleProps}
    />
  );

  if (isLinkToProfile && profileLink) {
    return (
      <Link to={profileLink} className={`e2e-author-link ${className || ''}`}>
        {NameComponent}
      </Link>
    );
  }

  return NameComponent;
};

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>,
});

const UserNameWithHOCs = injectIntl(UserName);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <UserNameWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
