import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import { Helmet } from 'react-helmet';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 60px;
`;

const eventPage = () => {
  return (
    <>
      <Helmet>
        <title>Events</title>
      </Helmet>

      <StyledContentContainer>Bla</StyledContentContainer>
    </>
  );
};

export default eventPage;
