import React from 'react';
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';
import Button from 'components/UI/Button';
import AvatarBubbles from 'components/AvatarBubbles';
import { Box } from 'cl2-component-library';
import { useTheme } from 'styled-components';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';

const HeaderTitle = styled.h1<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colorMain
      : theme.colorMain};
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  line-height: normal;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const HeaderSubtitle = styled.h2<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colorMain
      : theme.colorMain};
  font-size: ${fontSizes.xl}px;
  line-height: 28px;
  font-weight: 400;
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

interface Props {
  fontColors: 'light' | 'dark';
}

function getButtonStyle(fontColors: 'light' | 'dark') {
  if (fontColors === 'light') {
    return 'primary-inverse';
  }
  if (fontColors === 'dark') {
    return 'primary';
  }

  return undefined;
}

const Component = ({
  fontColors,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();

  const signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'signed-out header' },
    });
    openSignUpInModal();
  };

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
    const buttonStyle = getButtonStyle(fontColors);

    return (
      <Box
        id="hook-header-content"
        className="e2e-signed-out-header-title"
        width="100%"
        height="100%"
        maxWidth={`${theme.maxPageWidth + 60}px`}
        padding="50px 30px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        zIndex="1"
      >
        <HeaderTitle hasHeader={!!headerImage} fontColors={fontColors}>
          {headerTitle}
        </HeaderTitle>

        <HeaderSubtitle
          hasHeader={!!headerImage}
          className="e2e-signed-out-header-subtitle"
          fontColors={fontColors}
        >
          {headerSubtitle}
        </HeaderSubtitle>

        {displayHeaderAvatars && <StyledAvatarBubbles />}

        <SignUpButton
          fontWeight="500"
          padding="13px 22px"
          buttonStyle={buttonStyle}
          onClick={signUpIn}
          text={formatMessage(messages.createAccount)}
          className="e2e-signed-out-header-cta-button"
        />
      </Box>
    );
  }

  return null;
};

export default injectIntl(Component);
