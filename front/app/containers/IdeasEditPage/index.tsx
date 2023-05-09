import React from 'react';
import { isUnauthorizedError } from 'utils/helperUtils';
import { isError } from 'lodash-es';

// hooks
import useProjectBySlug from 'api/projects/useProjectBySlug';

// components
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';

import IdeasEditForm from './IdeasEditForm';

// tracks
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

interface Props {
  params: {
    ideaId: string;
  };
}

const IdeasEditPage = withRouter((props: Props & WithRouterProps) => {
  const project = useProjectBySlug(props.params.slug);

  if (isUnauthorizedError(project)) {
    return <Unauthorized />;
  }

  if (isError(project)) {
    return <PageNotFound />;
  }

  return <IdeasEditForm {...props} />;
});

export default IdeasEditPage;
