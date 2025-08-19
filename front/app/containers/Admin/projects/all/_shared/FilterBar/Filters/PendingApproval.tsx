import React from 'react';

import { InputContainer, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';

import CountBadge from 'components/UI/CountBadge';

import { useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';

const StyledInputContainer = styled(InputContainer)<{ isActive: boolean }>`
  ${({ isActive }) =>
    isActive
      ? `
    background-color: ${colors.primary};
    color: ${colors.white};
    &:focus {
      color: ${colors.white};  
    }
  `
      : ''}
`;

const PendingApproval = () => {
  const reviewState = useParam('review_state');
  const { formatMessage } = useIntl();

  const pendingReviewParams = {
    publicationStatusFilter: ['draft' as const],
    review_state: 'pending' as const,
    onlyProjects: true,
    rootLevelOnly: false,
  };

  const { data: pendingReviewStatusCounts } =
    useAdminPublicationsStatusCounts(pendingReviewParams);

  const totalPendingCount =
    pendingReviewStatusCounts?.data.attributes.status_counts.draft ?? 0;

  return (
    <StyledInputContainer
      isActive={reviewState === 'pending'}
      onClick={() => {
        setParam(
          'review_state',
          reviewState === 'pending' ? undefined : 'pending'
        );
      }}
    >
      {formatMessage(messages.pendingApproval)}
      <CountBadge count={totalPendingCount} />
    </StyledInputContainer>
  );
};

export default PendingApproval;
