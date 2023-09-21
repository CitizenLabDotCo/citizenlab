import React, { useEffect } from 'react';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesShow from 'containers/InitiativesShow';
import InitiativeShowPageTopBar from './InitiativeShowPageTopBar';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';
import { Spinner } from '@citizenlab/cl2-component-library';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useInitiativeBySlug from 'api/initiatives/useInitiativeBySlug';
import { useParams } from 'react-router-dom';

// style
import styled from 'styled-components';
import { isUnauthorizedRQ } from 'utils/errorUtils';

const Container = styled.div`
  background: #fff;
`;

const StyledInitiativeShowPageTopBar = styled(InitiativeShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const InitiativesShowPage = () => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });
  const { slug } = useParams() as { slug: string };

  const { data: initiative, status, error } = useInitiativeBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [initiative]);

  if (!initiativesEnabled) {
    // Ideally, this is covered by status === 'error' but currently there
    // a bug (in the BE?) that still shows this page to people with URL, even
    // if the feature is disabled.
    return <PageNotFound />;
  }

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

  if (!initiative) {
    return null;
  }

  return (
    <Container>
      <StyledInitiativeShowPageTopBar initiativeId={initiative.data.id} />
      <InitiativesShow initiativeId={initiative.data.id} />
    </Container>
  );
};

export default InitiativesShowPage;
