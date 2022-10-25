import React from 'react';

// components
import { Container, Content } from 'components/LandingPages/citizen';
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import { PageTitle } from 'containers/CustomPageShow';
import { Text } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const PageNotFound = () => (
  <Container>
    <PageNotFoundInner />
  </Container>
);

export const PageNotFoundInner = () => {
  const { formatMessage } = useIntl();

  const title = formatMessage(messages.notFoundTitle);
  const description = formatMessage(messages.notFoundDescription);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Content>
        <ContentContainer>
          <PageTitle>{title}</PageTitle>
          <Text mt="40px" color="textSecondary">
            {description}
          </Text>
        </ContentContainer>
      </Content>
    </>
  );
};

export default PageNotFound;
