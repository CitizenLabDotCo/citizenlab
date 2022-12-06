import React, { memo } from 'react';
import { FormattedDate } from 'react-intl';
// hooks
import useIdea from 'hooks/useIdea';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import Avatar from 'components/Avatar';
// components
import UserName from 'components/UI/UserName';
// styling
import styled from 'styled-components';
import messages from './messages';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 5px;
`;

interface Props {
  authorId: string | null;
  ideaId: string;
  className?: string;
}

const IdeaPostedBy = memo<Props>(({ authorId, ideaId, className }) => {
  const userName = (
    <UserName userId={authorId} isLinkToProfile fontWeight={500} />
  );
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const ideaPublishedAtDate = idea.attributes.published_at;
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
          size={30}
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

export default IdeaPostedBy;
