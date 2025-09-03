import React, { memo } from 'react';

import { colors, fontSizes, isRtl } from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';

import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  margin-top: -4px;
  margin-bottom: -6px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 5px;
  margin-left: -4px;

  ${isRtl`
    margin-right: -4px;
    margin-left: 5px;
  `}
`;

export interface Props {
  authorId: string | null;
  ideaId: string;
  compact?: boolean;
  className?: string;
  anonymous?: boolean;
}

const PostedBy = memo<Props>(
  ({ authorId, ideaId, compact, className, anonymous }) => {
    const { formatMessage } = useIntl();
    const { data: idea } = useIdeaById(ideaId);
    const { data: user } = useUserById(authorId);

    if (!isNilOrError(idea)) {
      // Ideas in pre-screening don't have a published_at date so use the created_at date
      const ideaPublishedAtDate =
        idea.data.attributes.published_at ?? idea.data.attributes.created_at;
      const authorHash = idea.data.attributes.author_hash;
      const isLinkToProfile =
        user?.data.attributes.registration_completed_at !== null;

      const userName = (
        <UserName
          userId={authorId}
          isLinkToProfile={isLinkToProfile}
          underline={isLinkToProfile}
          color={colors.textSecondary}
          fontSize={fontSizes.s}
          anonymous={anonymous}
        />
      );
      const date = (
        <FormattedDate
          value={ideaPublishedAtDate}
          year="numeric"
          month="long"
          day="numeric"
        />
      );

      return (
        <Item className={className} compact={compact}>
          <Header>{formatMessage(messages.postedBy)}</Header>
          <UserWrapper className="e2e-idea-author">
            <StyledAvatar
              userId={authorId}
              size={30}
              isLinkToProfile={isLinkToProfile}
              authorHash={authorHash}
            />
            <FormattedMessage
              {...messages.byUserOnDate}
              values={{ userName, date }}
            />
          </UserWrapper>
        </Item>
      );
    }

    return null;
  }
);

export default PostedBy;
