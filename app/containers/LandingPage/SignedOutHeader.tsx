import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import AvatarBubbles from 'components/AvatarBubbles';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  min-height: 450px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.desktop`
    min-height: 450px;
  `}

  ${media.smallerThanMaxTablet`
    min-height: 350px;
  `}

  ${media.smallerThanMinTablet`
    min-height: 300px;
  `}
`;

const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageBackground = styled.div<{ src: string | null }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
`;

const HeaderImageOverlay = styled.div`
  background: ${({ theme }) => theme.signedOutHeaderOverlayColor || theme.colorMain};
  opacity: ${({ theme }) => theme.signedOutHeaderOverlayOpacity};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  padding-top: 50px;
  padding-bottom: 50px;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const HeaderTitle = styled.h1<{ hasHeader: boolean }>`
  width: 100%;
  max-width: 600px;
  color: ${({ hasHeader, theme }) => hasHeader ? '#fff' : theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  line-height: normal;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const HeaderSubtitle = styled.h2<{ hasHeader: boolean }>`
  width: 100%;
  max-width: 375px;
  color: ${({ hasHeader, theme }) => hasHeader ? '#fff' : theme.colorMain};
  font-size: ${fontSizes.xl}px;
  line-height: 28px;
  font-weight: 400;
  max-width: 980px;
  text-align: center;
  text-decoration: none;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  padding: 0;
  margin: 0;
  margin-top: 30px;

  ${media.smallerThanMinTablet`
    margin-top: 15px;
  `}
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-top: 18px;
  min-height: 40px;
`;

const SignUpButton = styled(Button)`
  margin-top: 38px;

  ${media.smallerThanMinTablet`
    margin-top: 30px;
  `}
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {}

class SignedOutHeader extends PureComponent<Props, State> {
  goToSignUpPage = () => {
    trackEventByName(tracks.clickCreateAccountCTA, { extra: { location: 'signed-out header' } });
    clHistory.push('/sign-up');
  }

  handleAvatarBubblesOnClick = () => {
    trackEventByName(tracks.clickAvatarBubbles, { extra: { location: 'signed-out header' } });
  }

  render() {
    const { locale, tenant, className, theme } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const tenantLocales = tenant.attributes.settings.core.locales;
      const organizationNameMultiLoc = tenant.attributes.settings.core.organization_name;
      const headerTitleMultiLoc = tenant.attributes.settings.core.header_title;
      const headerSloganMultiLoc = tenant.attributes.settings.core.header_slogan;
      const tenantName = getLocalized(organizationNameMultiLoc, locale, tenantLocales);
      const tenantHeaderTitle = (headerTitleMultiLoc ? getLocalized(headerTitleMultiLoc, locale, tenantLocales) : null);
      const tenantHeaderSlogan = (headerSloganMultiLoc ? getLocalized(headerSloganMultiLoc, locale, tenantLocales) : null);
      const tenantHeaderImage = (tenant.attributes.header_bg ? tenant.attributes.header_bg.large : null);
      const title = (tenantHeaderTitle ? tenantHeaderTitle : <FormattedMessage {...messages.titleCity} values={{ name: tenantName }} />);
      const subtitle = (tenantHeaderSlogan ? tenantHeaderSlogan : <FormattedMessage {...messages.subtitleCity} />);
      const hasHeaderImage = (tenantHeaderImage !== null);

      return (
        <Container className={`e2e-signed-out-header ${className}`}>
          <Header id="hook-header">
            <HeaderImage id="hook-header-image">
              <HeaderImageBackground src={tenantHeaderImage} />
              <HeaderImageOverlay />
            </HeaderImage>

            <HeaderContent id="hook-header-content" className="e2e-signed-out-header-title">
              <HeaderTitle hasHeader={hasHeaderImage}>
                {title}
              </HeaderTitle>

              <HeaderSubtitle hasHeader={hasHeaderImage} className="e2e-signed-out-header-subtitle">
                {subtitle}
              </HeaderSubtitle>

              <StyledAvatarBubbles onClick={this.handleAvatarBubblesOnClick} />

              <SignUpButton
                fontWeight="500"
                padding="13px 22px"
                bgColor="#fff"
                textColor={theme.colorMain}
                onClick={this.goToSignUpPage}
                text={<FormattedMessage {...messages.createAccount} />}
                className="e2e-signed-out-header-cta-button"
              />
            </HeaderContent>
          </Header>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />
});

const SignedOutHeaderWithHoC = withTheme(SignedOutHeader);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignedOutHeaderWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
