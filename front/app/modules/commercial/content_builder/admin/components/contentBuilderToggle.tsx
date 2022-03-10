import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

const ContentBuilderToggle = ({ location: { pathname } }: WithRouterProps) => {
  const route = `${pathname}/content-builder`;
  return (
    <>
      <Link to={route}>Advanced Editor</Link>
    </>
  );
};

export default withRouter(ContentBuilderToggle);
