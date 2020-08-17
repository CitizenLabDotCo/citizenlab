import React from 'react';
import FeatureFlag from 'components/FeatureFlag';
import styled from 'styled-components';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';

const Badge = styled.div`
  color: #fff;
  font-size: 10px;
  line-height: normal;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 1px 6px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  margin-top: 2px;
  background-color: ${(props: any) => props.color};
`;

interface Props {
  isVerified: boolean;
}

const VerificationBadge = ({ isVerified }: Props) => (
  <FeatureFlag name="verification">
    <Badge color={isVerified ? colors.clGreen : colors.label}>
      {isVerified ? (
        <FormattedMessage {...messages.verified} />
      ) : (
        <FormattedMessage {...messages.unverified} />
      )}
    </Badge>
  </FeatureFlag>
);

export default VerificationBadge;
