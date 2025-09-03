import React from 'react';

import { Title, Text, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const PageNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  ${(props) =>
    media.tablet`
    min-height: calc(100vh - ${props.theme.mobileMenuHeight}px - ${props.theme.mobileTopBarHeight}px);
  `}
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
`;

const PageNotFound = () => {
  const { formatMessage } = useIntl();

  return (
    <main>
      <PageNotFoundWrapper>
        <Title mb="0">{formatMessage(messages.notFoundTitle)}</Title>
        <Text fontSize="l" color={'textSecondary'} mb="36px">
          {formatMessage(messages.pageNotFoundDescription)}
        </Text>
        <ButtonWithLink
          linkTo="/"
          text={formatMessage(messages.goBackToHomePage)}
          icon="arrow-left"
        />
      </PageNotFoundWrapper>
    </main>
  );
};

export default PageNotFound;
