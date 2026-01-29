import React, { useState, useEffect } from 'react';

import { Title, Text, media, Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Centerer from 'components/UI/Centerer';

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
  const [showContent, setShowContent] = useState(false);
  // show spinner for 3 seconds before showing content to avoid redirect 404 page flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <main>
        <Centerer h="500px">
          <Spinner />
        </Centerer>
      </main>
    );
  }

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
