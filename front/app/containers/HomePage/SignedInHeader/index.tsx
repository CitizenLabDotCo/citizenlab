import React, { lazy, Suspense } from 'react';
import { isNilOrError } from 'utils/helperUtils';

const FallbackStep = lazy(() => import('./FallbackStep'));

import HeaderImage from './HeaderImage';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

// hooks
import useCurrentOnboardingCampaign from 'hooks/useCurrentOnboardingCampaign';

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
  const currentOnboardingCampaign = useCurrentOnboardingCampaign();

  if (!isNilOrError(currentOnboardingCampaign)) {
    const onboardingCampaignName =
      currentOnboardingCampaign.data.attributes.name;

    return (
      <Header className={`e2e-signed-in-header`} id="hook-header">
        <HeaderImage />
        <Suspense fallback={null}>
          <FallbackStep
            currentOnboardingCampaignName={onboardingCampaignName}
          />
        </Suspense>
      </Header>
    );
  }

  return null;
};

export default SignedInHeader;
