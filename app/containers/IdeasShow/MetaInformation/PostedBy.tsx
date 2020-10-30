import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { FormattedDate } from 'react-intl';

// hooks
import useIdea from 'hooks/useIdea';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.label};
  font-size: ${fontSizes.small}px;

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
  className?: string;
  authorId: string | null;
  ideaId: string;
}

const PostedBy = memo<Props>(({ className, authorId, ideaId }) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const ideaPublishedAtDate = idea.attributes.published_at;
    const userName = (
      <UserName
        userId={authorId}
        isLinkToProfile={true}
        underline={true}
        color={colors.label}
        fontSize={fontSizes.small}
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
      <Container className={`e2e-idea-author ${className || ''}`}>
        <StyledAvatar
          userId={authorId}
          size="30px"
          isLinkToProfile={!!authorId}
        />
        <FormattedMessage
          {...messages.byUserOnDate}
          values={{ userName, date }}
        />
      </Container>
    );
  }

  return null;
});

export default PostedBy;
