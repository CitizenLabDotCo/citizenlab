import React from 'react';

import {
  Box,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import UserName from 'components/UI/UserName';

import { timeAgo } from 'utils/dateUtils';

interface Props {
  userId: string;
  createdAt: string;
}

const TimeAgo = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: 16px;
  margin-top: 1px;
  margin-left: 8px;
`;

const Comment = ({ userId, createdAt }: Props) => {
  const locale = useLocale();

  return (
    <Box width="100%" maxWidth="600px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <UserName
            userId={userId}
            underline
            fontSize={fontSizes.base}
            fontWeight={400}
            color={colors.textSecondary}
          />
          <TimeAgo>{timeAgo(Date.parse(createdAt), locale)}</TimeAgo>
        </Box>
        <MoreActionsMenu
          showLabel={false}
          actions={[
            {
              label: 'Edit',
              handler: () => console.log('Edit'),
            },
            {
              label: 'Delete',
              handler: () => console.log('Delete'),
            },
          ]}
        />
      </Box>
      <Text mt="12px" mb="20px">
        Content
      </Text>
    </Box>
  );
};

export default Comment;
