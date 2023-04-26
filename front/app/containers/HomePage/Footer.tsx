import React from 'react';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';
import useHomepageSettings from 'hooks/useHomepageSettings';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { HeadingFontStyle } from 'components/LandingPages/citizen/HeaderContent';
import { fontSizes } from 'utils/styleUtils';

// components
import AvatarBubbles from 'components/AvatarBubbles';
import CityLogoSection from 'components/CityLogoSection';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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

const FooterBannerHeading = styled.span`
  color: #fff;
  ${HeadingFontStyle};
  font-size: ${fontSizes.xxl}px;
  margin-bottom: 30px;
  max-width: 500px;
  text-align: center;
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-bottom: 45px;
`;

const Footer = () => {
  const authUser = useAuthUser();
  const localize = useLocalize();
  const homepageSettings = useHomepageSettings();

  const signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'footer' },
    });
    triggerAuthenticationFlow();
  };

  if (!isNilOrError(homepageSettings)) {
    // tranlate header slogan into a h2 wih a fallback
    const headerSloganMultiLoc =
      homepageSettings.attributes.banner_signed_out_subheader_multiloc;
    const displayHeaderAvatars =
      homepageSettings.attributes.banner_avatars_enabled;

    return (
      <>
        {!authUser && (
          <FooterBanner>
            <FooterBannerHeading>
              {headerSloganMultiLoc ? (
                localize(headerSloganMultiLoc)
              ) : (
                <FormattedMessage {...messages.subtitleCity} />
              )}
            </FooterBannerHeading>
            {displayHeaderAvatars && <StyledAvatarBubbles />}
            <Button
              fontWeight="500"
              padding="13px 22px"
              buttonStyle="primary-inverse"
              onClick={signUpIn}
              text={<FormattedMessage {...messages.createAccount} />}
            />
          </FooterBanner>
        )}
        <CityLogoSection />
      </>
    );
  }

  return null;
};

export default Footer;
