import React from 'react';
import styled, { css } from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';
import AvatarBubbles from 'components/AvatarBubbles';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import useFeatureFlag from 'hooks/useFeatureFlag';
import Outlet from 'components/Outlet';
import SignUpButton from '../SignUpButton';

const Container = styled.div<{
  align: 'center' | 'left';
  alignTo: 'center' | 'flex-start' | undefined;
}>`
  height: 100%;
  max-width: ${({ theme }) => theme.maxPageWidth + 60}px;
  padding: ${({ align }) => (align === 'left' ? '50px 100px' : '50px 30px')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${({ alignTo }) => alignTo || 'normal'};
  z-index: 1;
  box-sizing: content-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.smallerThanMaxTablet`
    padding: '50px 30px';
  `}
`;

export const HeadingFontStyle = css`
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  line-height: normal;
`;

const HeaderTitle = styled.h1<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
  align: 'center' | 'left';
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colorMain
      : theme.colorMain};
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxl}px;
  ${HeadingFontStyle};
  text-align: ${({ align }) => align};
  padding: 0;
  margin-bottom: 10px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${media.smallerThanMinTablet`
    margin-bottom: 15px;
  `}
`;

const HeaderSubtitle = styled.h2<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
  align: 'center' | 'left';
  displayHeaderAvatars: boolean;
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colorMain
      : theme.colorMain};
  font-size: ${fontSizes.large}px;
  line-height: 28px;
  font-weight: 400;
  text-align: ${({ align }) => align};
  text-decoration: none;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;

  ${({ displayHeaderAvatars }) =>
    // needed because we don't always
    // show avatars
    !displayHeaderAvatars &&
    `
      margin-bottom: 38px;

      ${media.smallerThanMinTablet`
        margin-bottom: 30px;
      `}
  `}
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  min-height: 40px;
  margin-bottom: 30px;

  ${media.smallerThanMinTablet`
    margin-bottom: 30px;
  `}
`;

type TAlign = 'center' | 'left';
interface Props {
  fontColors: 'light' | 'dark';
  align?: TAlign;
}

function getButtonStyle(fontColors: 'light' | 'dark') {
  switch (fontColors) {
    case 'light':
      return 'primary-inverse';
    case 'dark':
      return 'primary';
  }
}

function getAlignItems(align: TAlign) {
  if (align === 'center') return 'center';
  if (align === 'left') return 'flex-start';

  return undefined;
}

const HeaderContent = ({
  align = 'center',
  fontColors,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();

  const signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'signed-out header' },
    });
    openSignUpInModal();
  };
  const buttonStyle = getButtonStyle(fontColors);
  const customizableHomepageBannerEnabled = useFeatureFlag({
    name: 'customizable_homepage_banner',
  });

  if (!isNilOrError(appConfiguration)) {
    const coreSettings = appConfiguration.data.attributes.settings.core;
    const headerTitle = coreSettings.header_title
      ? localize(coreSettings.header_title)
      : formatMessage(messages.titleCity);
    const headerSubtitle = coreSettings.header_slogan
      ? localize(coreSettings.header_slogan)
      : formatMessage(messages.subtitleCity);
    const headerImage = appConfiguration.data.attributes.header_bg?.large;
    const displayHeaderAvatars =
      appConfiguration.data.attributes.settings.core.display_header_avatars;
    const customizableHomepageBanner =
      appConfiguration.data.attributes.settings.customizable_homepage_banner;

    return (
      <Container
        id="hook-header-content"
        className="e2e-signed-out-header-title"
        alignTo={getAlignItems(align)}
        align={align}
      >
        <HeaderTitle
          hasHeader={!!headerImage}
          fontColors={fontColors}
          align={align}
        >
          {headerTitle}
        </HeaderTitle>

        <HeaderSubtitle
          hasHeader={!!headerImage}
          className="e2e-signed-out-header-subtitle"
          fontColors={fontColors}
          align={align}
          displayHeaderAvatars={displayHeaderAvatars}
        >
          {headerSubtitle}
        </HeaderSubtitle>

        {displayHeaderAvatars && <StyledAvatarBubbles />}

        {!customizableHomepageBannerEnabled && (
          <SignUpButton buttonStyle={buttonStyle} signUpIn={signUpIn} />
        )}
        <Outlet
          id="app.containers.LandingPage.SignedOutHeader.CTA"
          ctaType={customizableHomepageBanner.cta_signed_out_type}
          customizedButtonConfig={
            customizableHomepageBanner.cta_signed_out_customized_button
          }
          buttonStyle={buttonStyle}
          signUpIn={signUpIn}
        />
      </Container>
    );
  }

  return null;
};

export default injectIntl(HeaderContent);
