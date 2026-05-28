import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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

const VerificationBadge = ({ isVerified }: Props) => {
  const { data: verificationMethods } = useVerificationMethods();
  const showVerificationInProfile = verificationMethods?.data.some(
    (method) => method.attributes.show_verification_in_profile
  );
  if (!showVerificationInProfile) return null;

  return (
    <Badge color={isVerified ? colors.success : colors.textSecondary}>
      {isVerified ? (
        <FormattedMessage {...messages.verified} />
      ) : (
        <FormattedMessage {...messages.unverified} />
      )}
    </Badge>
  );
};

export default VerificationBadge;
