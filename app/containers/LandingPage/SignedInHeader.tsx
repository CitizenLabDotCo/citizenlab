import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
// import Button from 'components/UI/Button';
// import IdeaButton from 'components/IdeaButton';
// import AvatarBubbles from 'components/AvatarBubbles';
import ContentContainer from 'components/ContentContainer';

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
// import { media, fontSizes } from 'utils/styleUtils';

const Header = styled.div`
  width: 100%;
  height: 195px;
  position: relative;
`;

const HeaderImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HeaderImage = styled.img`
  width: 100%;
`;

const HeaderImageOverlay = styled.div`
  background: linear-gradient(0deg, rgba(22, 58, 125, 0.9), rgba(22, 58, 125, 0.9));
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const StyledContentContainer = styled(ContentContainer)`
  height: 100%;
`;

const NoAvatarUserIcon = styled.svg`
  fill: #fff;
  fill: linear-gradient(219.65deg, rgba(255, 255, 255, 0.5) -5.63%, rgba(255, 255, 255, 0.16) 100%);
  width: 50px;
  height: 50px;
`;

const CompleteProfileIcon = styled.svg`
  width: 50px;
  height: 50px;
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

class SignedInHeader extends PureComponent<Props, State> {
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
          <HeaderImageContainer>
            {tenantHeaderImage && <HeaderImage src={tenantHeaderImage} />}
            <HeaderImageOverlay />
          </HeaderImageContainer>

          <HeaderContent>
            <StyledContentContainer>
              <NoAvatarUserIcon height="100%" viewBox="0 0 56 56"><path d="M28 0C12.56 0 0 12.561 0 28s12.56 28 28 28c.282 0 .558-.035.84-.042l.098.019a1.115 1.115 0 0 0 .548-.022l.131-.037C44.303 55.071 56 42.894 56 28 56 12.561 43.439 0 28 0zm16.641 47.504c-.109-.356-.356-.658-.716-.776l-6.142-2.044c-2.145-.895-3.143-4.326-3.376-5.703 1.589-1.477 3.057-3.678 3.057-5.665 0-.677.191-.936.154-.942a1.17 1.17 0 0 0 .8-.698c.115-.286 1.12-2.851 1.12-4.58 0-.096-.011-.191-.034-.282-.147-.586-.49-1.176-1.004-1.545v-5.432c0-3.358-1.021-4.765-2.104-5.579-.244-1.672-2.033-4.922-8.396-4.922-6.505 0-10.5 6.115-10.5 10.5v5.432c-.513.369-.856.959-1.003 1.545a1.183 1.183 0 0 0-.035.282c0 1.729 1.005 4.294 1.12 4.58.14.348.324.569.688.661.075.044.266.305.266.979 0 1.987 1.468 4.188 3.057 5.665-.231 1.375-1.221 4.805-3.297 5.672l-6.223 2.075c-.357.118-.614.413-.726.77C5.838 42.786 2.329 35.801 2.329 28c0-14.152 11.515-25.667 25.667-25.667S53.662 13.848 53.662 28c.004 7.803-3.508 14.793-9.021 19.504z"/></NoAvatarUserIcon>
              <CompleteProfileIcon height="100%" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="28" fill="url(#paint0_linear)" fill-opacity=".5"/><path d="M19 33.252v3.75h3.75l11.06-11.06-3.75-3.75L19 33.252zm17.71-10.21a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#fff"/><defs><linearGradient id="paint0_linear" x1="43.68" x2="6.72" y2="48.16" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".34"/></linearGradient></defs></CompleteProfileIcon>
            </StyledContentContainer>
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
    {dataProps => <SignedInHeader {...inputProps} {...dataProps} />}
  </Data>
);
