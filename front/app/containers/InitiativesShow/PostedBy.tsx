import React from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import UserName from 'components/UI/UserName';
import Link from 'utils/cl-router/Link';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const InitiativesIcon = styled(Icon)`
  width: 42px;
  height: 42px;
  background-color: rgba(4, 77, 108, 0.06);
  fill: ${colors.primary};
  border-radius: 50%;
  padding: 10px;
  margin-right: 17px;
`;

const PostedByWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PostedByText = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  margin-bottom: 3px;
`;

const AboutInitiativesLink = styled(Link)`
  font-size: ${fontSizes.s}px;
  color: ${colors.coolGrey600};
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.coolGrey600)};
    text-decoration: underline;
  }
`;

interface Props {
  authorId: string | null | undefined;
  className?: string;
  showAboutInitiatives: boolean;
  anonymous?: boolean;
}

const PostedBy = ({
  authorId,
  className,
  showAboutInitiatives,
  anonymous,
}: Props) => {
  if (authorId || anonymous) {
    return (
      <Container id="e2e-initiative-posted-by" className={className || ''}>
        <InitiativesIcon name="initiatives" />
        <PostedByWrapper>
          <PostedByText>
            <FormattedMessage
              {...messages.postedBy}
              values={{
                authorName: (
                  <UserName
                    userId={authorId || null}
                    fontWeight={500}
                    isLinkToProfile={true}
                    anonymous={anonymous}
                    underline
                  />
                ),
              }}
            />
          </PostedByText>
          {showAboutInitiatives && (
            <AboutInitiativesLink to="/pages/initiatives">
              <FormattedMessage {...messages.learnMore} />
            </AboutInitiativesLink>
          )}
        </PostedByWrapper>
      </Container>
    );
  }

  return null;
};

export default PostedBy;
