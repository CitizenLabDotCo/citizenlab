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

// utils
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { useParams } from 'react-router-dom';

const IdeasEditPage = () => {
  const { ideaId } = useParams() as { ideaId: string };
  const { status, error } = useIdeaById(ideaId);

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

  return <IdeasEditForm ideaId={ideaId} />;
};

export default IdeasEditPage;
