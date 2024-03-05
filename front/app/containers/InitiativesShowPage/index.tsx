import React from 'react';

import { Spinner, media } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useInitiativeBySlug from 'api/initiatives/useInitiativeBySlug';

import useFeatureFlag from 'hooks/useFeatureFlag';

import InitiativesShow from 'containers/InitiativesShow';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isUnauthorizedRQ } from 'utils/errorUtils';

import InitiativeShowPageTopBar from './InitiativeShowPageTopBar';

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

const StyledInitiativesShow = styled(InitiativesShow)`
  ${({ theme }) => media.tablet`
    margin-top: ${theme.menuHeight}px;
  `}
`;

const InitiativesShowPage = () => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });
  const { slug } = useParams() as { slug: string };
  const { data: initiative, status, error } = useInitiativeBySlug(slug);

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

  return (
    <Container>
      <StyledInitiativeShowPageTopBar initiativeId={initiative.data.id} />
      <StyledInitiativesShow initiativeId={initiative.data.id} />
    </Container>
  );
};

export default InitiativesShowPage;
