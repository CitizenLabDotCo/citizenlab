import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import messages from './messages';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

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

    if (!isNilOrError(idea)) {
      const ideaPublishedAtDate = idea.data.attributes.published_at;
      const authorHash = idea.data.attributes.author_hash;

      const userName = (
        <UserName
          userId={authorId}
          isLinkToProfile={true}
          underline={true}
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
              isLinkToProfile={!!authorId}
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
