import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesIndexMeta from './InitiativesIndexMeta';
import InitiativesHeader from './InitiativesHeader';
import InitiativeCards from 'components/InitiativeCards';
import ContentContainer from 'components/ContentContainer';
import CityLogoSection from 'components/CityLogoSection';
import ContentContainer from 'components/ContentContainer';
import InitiativeButton from 'components/InitiativeButton';
import InitiativeCards from 'components/InitiativeCards';
import InitiativesHeader from './InitiativesHeader';
import InitiativesIndexMeta from './InitiativesIndexMeta';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const Container = styled.main``;

const FooterBanner = styled.div`
  background: ${({ theme }) => theme.colors.tenantPrimary};
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

  ${media.tablet`
      font-size: ${fontSizes.xxxl}px;
    `}
`;

const StyledContentContainer = styled(ContentContainer)`
  width: 100%;
  background-color: ${colors.background};
  padding-bottom: 150px;

  ${media.tablet`
    padding-bottom: 80px;
  `}
`;

const Padding = styled.div`
  width: 100%;
  height: 100px;
  ${media.phone`
    height: 40px;
    `}
`;

const InitiativeIndexPage = () => {
  const initiativePermissions = useInitiativesPermissions('posting_initiative');
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  if (!isNilOrError(initiativePermissions)) {
    const { enabled } = initiativePermissions;
    const proposalSubmissionEnabled = enabled === true || enabled === 'maybe';

    return (
      <>
        <InitiativesIndexMeta />
        <Container>
          <InitiativesHeader />
          <StyledContentContainer maxWidth="100%">
            <Padding />
            <InitiativeCards
              invisibleTitleMessage={messages.invisibleTitleInitiativeCards}
            />
          </StyledContentContainer>
          {proposalSubmissionEnabled && (
            <FooterBanner>
              <FooterMessage>
                <FormattedMessage {...messages.footer} />
              </FooterMessage>

              <InitiativeButton
                buttonStyle="white"
                location="initiatives_footer"
              />
            </FooterBanner>
          )}
          <CityLogoSection />
        </Container>
      </>
    );
  }

  return null;
};

export default InitiativeIndexPage;
