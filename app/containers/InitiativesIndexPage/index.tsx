import React, { memo } from 'react';

// components
import Footer from 'components/Footer';
import InitiativesIndexMeta from './InitiativesIndexMeta';
import InitiativesHeader from './InitiativesHeader';
import SuccessStories from './SuccessStories';
import InitiativeCards from 'components/InitiativeCards';
import ContentContainer from 'components/ContentContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import Button from 'components/UI/Button';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const FooterBanner: any = styled.div`
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
`;

const trackInitiative = () => {
  trackEventByName(tracks.clickStartInitiativesCTA, { extra: { location: 'initiatives footer' } });
};

export default withTheme(memo(({ theme }: any) => (
  <>
    <InitiativesIndexMeta />
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

      <Button
        fontWeight="500"
        padding="13px 22px"
        bgColor="#fff"
        textColor={theme.colorText}
        linkTo="/initiatives/new"
        onClick={trackInitiative}
        icon="arrowLeft"
        iconPos="right"
        text={<FormattedMessage {...messages.startInitiative} />}
      />
    </FooterBanner>
    <Footer />
  </>
)));
