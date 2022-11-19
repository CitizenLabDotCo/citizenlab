import React from 'react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components and styling
import Button from 'components/UI/Button';
import styled from 'styled-components';
import { Title, Text, media } from '@citizenlab/cl2-component-library';

const PageNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
`;

const PageNotFound = () => {
  const { formatMessage } = useIntl();

  return (
    <PageNotFoundWrapper>
      <Title mb="0">{formatMessage(messages.notFoundTitle)}</Title>
      <Text fontSize="l" color={'textSecondary'} mb="35px">
        {formatMessage(messages.pageNotFoundDescription)}
      </Text>
      <Button
        linkTo="/"
        text={formatMessage(messages.goBackToHomePage)}
        icon="arrow-left"
      />
    </PageNotFoundWrapper>
  );
};

export default PageNotFound;
