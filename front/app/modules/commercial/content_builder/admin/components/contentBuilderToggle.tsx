import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

const contentBuilderToggle = memo<WithRouterProps>(
  ({ location: { pathname } }) => {
    const route = `${pathname}/content-builder`;
    return (
      <>
        <Link to={route}>Advanced Editor</Link>
      </>
    );
  }
);

export default withRouter(contentBuilderToggle);
