import React from 'react';

import { media, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ContentContainer from 'components/ContentContainer';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
  padding-top: 60px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  padding: 0 0 40px 0;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}
`;

const SubscriptionEndedPage = () => (
  <main>
    <Container>
      <ContentContainer>
        <Title>
          <FormattedMessage {...messages.accessDenied} />
        </Title>
        <div>
          <FormattedMessage {...messages.subscriptionEnded} />
        </div>
      </ContentContainer>
    </Container>
  </main>
);

export default SubscriptionEndedPage;
