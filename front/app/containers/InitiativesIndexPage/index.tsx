import React, { memo } from 'react';

// components
import InitiativesIndexMeta from './InitiativesIndexMeta';
import InitiativesHeader from './InitiativesHeader';
import SuccessStories from './SuccessStories';
import InitiativeCards from 'components/InitiativeCards';
import ContentContainer from 'components/ContentContainer';
import CityLogoSection from 'components/CityLogoSection';
import InitiativeButton from 'components/InitiativeButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.main``;

const FooterBanner = styled.div`
  background: ${({ theme }) => theme.colorMain};
  width: 100%;
  min-height: 300px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 50px;
  padding-bottom: 60px;
`;

const FooterMessage = styled.h2`
  color: #fff;
  font-size: ${fontSizes.xxxl}px;
  line-height: normal;
  font-weight: 600;
  margin-bottom: 30px;
  max-width: 500px;
  text-align: center;

  ${media.smallerThanMaxTablet`
      font-size: ${fontSizes.xxxl}px;
    `}
`;

const StyledContentContainer = styled(ContentContainer)`
  width: 100%;
  background-color: ${colors.background};
  padding-bottom: 150px;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
  `}
`;

const Padding = styled.div`
  width: 100%;
  height: 100px;
  ${media.smallerThanMinTablet`
    height: 40px;
  `}
`;

interface Props {}

const InitiativeIndexPage = memo<Props>(() => {
  return (
    <>
      <InitiativesIndexMeta />
      <Container>
        <InitiativesHeader />
        <StyledContentContainer maxWidth="100%">
          <SuccessStories />
          <Padding />
          <InitiativeCards
            invisibleTitleMessage={messages.invisibleTitleInitiativeCards}
          />
        </StyledContentContainer>
        <FooterBanner>
          <FooterMessage>
            <FormattedMessage {...messages.footer} />
          </FooterMessage>

          <InitiativeButton buttonStyle="white" location="initiatives_footer" />
        </FooterBanner>
        <CityLogoSection />
      </Container>
    </>
  );
});

export default InitiativeIndexPage;
