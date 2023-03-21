import React from 'react';
import { isUnauthorizedError } from 'utils/helperUtils';
import { isError } from 'lodash-es';

// hooks
import useProject from 'hooks/useProject';

// components
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';

// feature flag variant
import IdeasEditPageWithJSONForm from './WithJSONForm';

// tracks
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

interface Props {
  params: {
    ideaId: string;
  };
}

const IdeasEditPage = withRouter((props: Props & WithRouterProps) => {
  const project = useProject({ projectSlug: props.params.slug });

  if (isUnauthorizedError(project)) {
    return <Unauthorized />;
  }

  if (isError(project)) {
    return <PageNotFound />;
  }

  return <IdeasEditPageWithJSONForm {...props} />;
});

export default IdeasEditPage;
