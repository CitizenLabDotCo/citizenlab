import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';
import AvatarBubbles from 'components/AvatarBubbles';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Header = styled.div`
  width: 100%;
  height: 550px;
  margin: 0;
  padding: 0;
  position: relative;

  ${media.smallerThanMinTablet`
    height: 400px;
  `}
`;

const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageBackground: any = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${(props: any) => props.src});
`;

const HeaderImageOverlay = styled.div`
  background: ${(props) => props.theme.colorMain};
  opacity: 0.9;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 35px;
  line-height: normal;
  font-weight: 600;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: 46px;
    line-height: 58px;
  `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxxl}px;
    line-height: 39px;
  `}
`;

const HeaderSubtitle: any = styled.h2`
  width: 100%;
  max-width: 375px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 300;
  hyphens: auto;
  max-width: 980px;
  text-align: center;
  text-decoration: none;
  padding: 0;
  padding-bottom: 0px;
  margin-bottom: 20px;
  margin-top: 25px;
  border-bottom: solid 1px transparent;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xl}px;
    font-weight: 300;
    line-height: 26px;
    margin-top: 15px;
    margin-bottom: 20px;
  `}
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-bottom: 45px;
`;

const SignUpButton = styled(Button)`
  .Button.button.primary-inverse {
    color: ${(props: any) => props.theme.colorText};
  }
`;

const StyledIdeaButton = styled(IdeaButton)`
  display: none;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class SignedOutHeader extends PureComponent<Props, State> {
  goToSignUpPage = () => {
    trackEvent({ ...tracks.clickCreateAccountCTA, properties: { extra: { location: 'header' } } });
    clHistory.push('/sign-up');
  }

  render() {
    const { locale, tenant, authUser, className } = this.props;

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
        <Header className={className} id="hook-header">
          <HeaderImage id="hook-header-image">
            <HeaderImageBackground src={tenantHeaderImage} />
            <HeaderImageOverlay />
          </HeaderImage>

          <HeaderContent id="hook-header-content">
            <HeaderTitle hasHeader={hasHeaderImage}>
              {title}
            </HeaderTitle>

            <HeaderSubtitle hasHeader={hasHeaderImage}>
              {subtitle}
            </HeaderSubtitle>

            <StyledAvatarBubbles />

            {authUser ? (
              <StyledIdeaButton style="primary-inverse" />
            ) : (
              <SignUpButton
                style="primary-inverse"
                fontWeight="500"
                padding="15px 22px"
                onClick={this.goToSignUpPage}
                text={<FormattedMessage {...messages.createAccount} />}
              />
            )}
          </HeaderContent>
        </Header>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignedOutHeader {...inputProps} {...dataProps} />}
  </Data>
);
