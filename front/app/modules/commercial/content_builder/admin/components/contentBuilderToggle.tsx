import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

const ContentBuilderToggle = ({ params }: WithRouterProps) => {
  return (
    <>
      <Link
        to={`/admin/content-builder/projects/${params.projectId}/description`}
      >
        Advanced Editor
      </Link>
    </>
  );
};

export default withRouter(ContentBuilderToggle);
