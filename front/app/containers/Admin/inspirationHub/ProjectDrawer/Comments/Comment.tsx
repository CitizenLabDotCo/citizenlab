import React from 'react';

import {
  Box,
  Text,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useDeleteProjectLibraryExternalComment from 'api/project_library_external_comments/useDeleteProjectLibraryExternalComment';

import useLocale from 'hooks/useLocale';

import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import { Name } from 'components/UI/UserName';

import { timeAgo } from 'utils/dateUtils';

const TimeAgo = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: 16px;
  margin-top: 1px;
  margin-left: 8px;
`;

const BADGE_STYLES = {
  'go-vocal': {
    bgColor: colors.red100,
    color: 'red800',
  },
  'platform-moderator': {
    bgColor: colors.teal100,
    color: 'teal700',
  },
} as const;

interface Props {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  badgeText?: string;
  badgeType?: 'go-vocal' | 'platform-moderator';
  body: string;
}

const Comment = ({
  id,
  projectId,
  name,
  createdAt,
  badgeText,
  badgeType,
  body,
}: Props) => {
  const locale = useLocale();
  const { mutate: deleteComment } = useDeleteProjectLibraryExternalComment();

  return (
    <Box width="100%" maxWidth="600px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Name
            underline
            fontSize={fontSizes.base}
            fontWeight={400}
            color={colors.textSecondary}
          >
            {name}
          </Name>
          <TimeAgo>{timeAgo(Date.parse(createdAt), locale)}</TimeAgo>
          {badgeText && badgeType && (
            <Box
              display="inline-block"
              bgColor={BADGE_STYLES[badgeType].bgColor}
              borderRadius={stylingConsts.borderRadius}
              p="2px 4px"
              ml="8px"
            >
              <Text
                as="span"
                m="0"
                fontWeight="semi-bold"
                fontSize="xs"
                color={BADGE_STYLES[badgeType].color}
              >
                {badgeText}
              </Text>
            </Box>
          )}
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
              handler: () => {
                if (window.confirm('Are you sure you want to delete this?')) {
                  deleteComment({
                    externalCommentId: id,
                    projectId,
                  });
                }
              },
            },
          ]}
        />
      </Box>
      <Text mt="12px" mb="20px">
        {body}
      </Text>
    </Box>
  );
};

export default Comment;
