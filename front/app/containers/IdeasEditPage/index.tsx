import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isUnauthorizedRQ } from 'utils/errorUtils';

import useIdeaById from 'api/ideas/useIdeaById';

import IdeasEditForm from './IdeasEditForm';

// router

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
