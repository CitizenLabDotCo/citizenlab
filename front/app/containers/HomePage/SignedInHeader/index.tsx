import React, { lazy, Suspense } from 'react';

const FallbackStep = lazy(() => import('./FallbackStep'));

import HeaderImage from './HeaderImage';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

// hooks

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

export const Left = styled.div`
  display: flex;
  align-items: center;
  margin-right: 60px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-right: 0;
    flex-direction: column;
    align-items: flex-start;
  `}

  ${media.phone`
    align-items: center;
    margin-bottom: 30px;
  `}
`;

export const Right = styled.div`
  display: flex;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const SignedInHeader = () => {
  return (
    <Header className={`e2e-signed-in-header`} id="hook-header">
      <HeaderImage />
      <Suspense fallback={null}>
        <FallbackStep />
      </Suspense>
    </Header>
  );
};

export default SignedInHeader;
