import React, { useState } from 'react';

import {
  Box,
  Text,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { ExternalCommentData } from 'api/project_library_external_comments/types';
import useDeleteProjectLibraryExternalComment from 'api/project_library_external_comments/useDeleteProjectLibraryExternalComment';

import useLocale from 'hooks/useLocale';

import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import { Name } from 'components/UI/UserName';

import { useIntl } from 'utils/cl-intl';
import { timeAgo } from 'utils/dateUtils';

import CommentEdit from './CommentEdit';
import getAuthorNames from './getAuthorNames';
import messages from './messages';

const TimeAgo = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: 16px;
  margin-top: 1px;
  margin-left: 8px;
`;

const BADGE_STYLES = {
  User: {
    bgColor: colors.red100,
    color: 'red800',
  },
  ExternalUser: {
    bgColor: colors.teal100,
    color: 'teal700',
  },
} as const;

interface Props {
  projectId: string;
  comment: ExternalCommentData;
}

const Comment = ({ projectId, comment }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const locale = useLocale();
  const { mutate: deleteComment } = useDeleteProjectLibraryExternalComment();
  const { data: authUser } = useAuthUser();

  const { formatMessage } = useIntl();

  if (!authUser) return null;

  const { id } = comment;
  const {
    author_first_name,
    author_id,
    author_last_name,
    author_type,
    body,
    created_at,
    tenant_name,
  } = comment.attributes;

  const badgeText = author_type === 'User' ? 'Go Vocal' : tenant_name;

  const allowEditOrDelete = authUser.data.id === author_id;

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
            {`${author_first_name} ${author_last_name}`}
          </Name>
          <TimeAgo>{timeAgo(Date.parse(created_at), locale)}</TimeAgo>
          <Box
            display="inline-block"
            bgColor={BADGE_STYLES[author_type].bgColor}
            borderRadius={stylingConsts.borderRadius}
            p="2px 4px"
            ml="8px"
          >
            <Text
              as="span"
              m="0"
              fontWeight="semi-bold"
              fontSize="xs"
              color={BADGE_STYLES[author_type].color}
            >
              {badgeText}
            </Text>
          </Box>
        </Box>
        {allowEditOrDelete && (
          <MoreActionsMenu
            showLabel={false}
            actions={[
              {
                label: formatMessage(messages.edit),
                handler: () => setIsEditing(true),
              },
              {
                label: formatMessage(messages.delete),
                handler: () => {
                  if (
                    window.confirm(
                      formatMessage(messages.areYouSureYouWantToDeleteThis)
                    )
                  ) {
                    deleteComment({
                      externalCommentId: id,
                      projectId,
                      externalCommentReqBody: getAuthorNames(authUser),
                    });
                  }
                },
              },
            ]}
          />
        )}
      </Box>
      <Box mt="12px" mb="20px">
        {isEditing ? (
          <CommentEdit
            projectId={projectId}
            commentId={id}
            body={body}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Text m="0">{body}</Text>
        )}
      </Box>
    </Box>
  );
};

export default Comment;
