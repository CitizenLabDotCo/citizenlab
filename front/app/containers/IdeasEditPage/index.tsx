import React from 'react';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';

// components
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';
import VerticalCenterer from 'components/VerticalCenterer';
import { Spinner } from '@citizenlab/cl2-component-library';
import IdeasEditForm from './IdeasEditForm';

// router
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// utils
import { isUnauthorizedRQ } from 'utils/errorUtils';

interface Props {
  params: {
    ideaId: string;
  };
}

const IdeasEditPage = withRouter((props: Props & WithRouterProps) => {
  const { status, error } = useIdeaById(props.params.ideaId);

  if (status === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (status === 'error') {
    if (isUnauthorizedRQ(error)) {
      return <Unauthorized />;
    }

    return <PageNotFound />;
  }

  return <IdeasEditForm {...props} />;
});

export default IdeasEditPage;
