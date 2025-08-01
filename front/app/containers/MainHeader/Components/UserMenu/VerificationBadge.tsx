import React, { lazy, Suspense } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const FeatureFlag = lazy(() => import('components/FeatureFlag'));

const Badge = styled.div`
  color: #fff;
  font-size: 10px;
  line-height: normal;
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 1px 6px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  margin-top: 2px;
  background-color: ${(props) => props.color};
`;

interface Props {
  isVerified: boolean;
}

const VerificationBadge = ({ isVerified }: Props) => (
  <Suspense fallback={null}>
    <FeatureFlag name="verification">
      <Badge color={isVerified ? colors.success : colors.textSecondary}>
        {isVerified ? (
          <FormattedMessage {...messages.verified} />
        ) : (
          <FormattedMessage {...messages.unverified} />
        )}
      </Badge>
    </FeatureFlag>
  </Suspense>
);

export default VerificationBadge;
