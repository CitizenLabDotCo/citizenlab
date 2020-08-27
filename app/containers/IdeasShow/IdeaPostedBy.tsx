import React, { memo } from 'react';

// components
import UserName from 'components/UI/UserName';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.small}px;
  `}
`;

interface Props {
  authorId: string | null;
  className?: string;
}

const IdeaPostedBy = memo<Props>(({ authorId, className }) => {
  const userName = <UserName userId={authorId} linkToProfile emphasize />;

  return (
    <Container className={className}>
      <FormattedMessage {...messages.ideaPostedBy} values={{ userName }} />
    </Container>
  );
});

export default IdeaPostedBy;
