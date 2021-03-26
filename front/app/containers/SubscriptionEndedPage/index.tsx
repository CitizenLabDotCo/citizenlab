import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
  padding-top: 60px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  padding: 0 0 40px 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}
`;

export default React.memo(() => (
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
));
