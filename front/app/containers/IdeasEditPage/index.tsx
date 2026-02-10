import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import useIdeaById from 'api/ideas/useIdeaById';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isUnauthorizedRQ } from 'utils/errorUtils';
import { usePermission } from 'utils/permissions';

import IdeasEditForm from './IdeasEditForm';

const IdeasEditPage = () => {
  const { ideaId } = useParams({ from: '/$locale/ideas/edit/$ideaId' });
  const { status, error, data: idea } = useIdeaById(ideaId);
  const ideaEditPermission = usePermission({
    item: idea?.data || null,
    action: 'edit',
  });

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

  if (!ideaEditPermission) {
    return <Unauthorized />;
  }

  return <IdeasEditForm ideaId={ideaId} />;
};

export default IdeasEditPage;
