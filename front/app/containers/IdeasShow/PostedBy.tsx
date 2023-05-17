import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import UserName from 'components/UI/UserName';
import Avatar from 'components/Avatar';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { FormattedDate } from 'react-intl';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';

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
  anonymous?: boolean;
  className?: string;
}

const IdeaPostedBy = memo<Props>(
  ({ authorId, ideaId, anonymous, className }) => {
    const userName = (
      <UserName
        userId={authorId}
        isLinkToProfile
        fontWeight={500}
        anonymous={anonymous}
      />
    );
    const { data: idea } = useIdeaById(ideaId);

    if (!isNilOrError(idea)) {
      const ideaPublishedAtDate = idea.data.attributes.published_at;
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
  }
);

export default IdeaPostedBy;
