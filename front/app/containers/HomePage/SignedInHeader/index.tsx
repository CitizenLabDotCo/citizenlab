import React from 'react';

// components
import HeaderImage from './HeaderImage';

// tracking

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Header = styled.div`
  width: 100%;
  height: 190px;
  position: relative;
  display: flex;
  flex-direction: column;

  ${media.tablet`
    height: 320px;
  `}

  ${media.phone`
    height: 400px;
  `}
`;

const SignedInHeader = () => {
  return (
    <Header className={`e2e-signed-in-header`} id="hook-header">
      <HeaderImage />
    </Header>
  );
};

export default SignedInHeader;
