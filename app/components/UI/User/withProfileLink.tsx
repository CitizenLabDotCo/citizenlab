import React from 'react';
import Link from 'utils/cl-router/Link';

function withProfileLink(
  UserNameComponent: JSX.Element,
  profileLink: string,
  className?: string
) {
  return (
    <Link to={profileLink} className={`e2e-author-link ${className || ''}`}>
      {UserNameComponent}
    </Link>
  );
}

export default withProfileLink;
