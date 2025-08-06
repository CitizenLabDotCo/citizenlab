import React from 'react';

import {
  Box,
  InputContainer,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';

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

  return (
    <Box position="relative">
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
      </StyledInputContainer>
      <Box
        position="absolute"
        as="span"
        top="0px"
        right="4px"
        bgColor={colors.red100}
        color={colors.red800}
        style={{ fontWeight: 'bold' }}
        py="0"
        px="4px"
        borderRadius={stylingConsts.borderRadius}
      >
        {pendingReviewStatusCounts?.data.attributes.status_counts.draft ?? 0}
      </Box>
    </Box>
  );
};

export default PendingApproval;
