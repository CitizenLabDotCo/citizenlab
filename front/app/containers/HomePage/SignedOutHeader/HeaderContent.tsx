import AvatarBubbles from 'components/AvatarBubbles';
import {
  Container,
  getAlignItems,
  HeaderSubtitle,
  HeaderTitle,
  TAlign,
} from 'components/LandingPages/citizen/HeaderContent';
import { WrappedComponentProps } from 'react-intl';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import useHomepageSettings from 'api/home_page/useHomepageSettings';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import styled from 'styled-components';
import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';
import { isEmptyMultiloc, isNilOrError } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';
import messages from '../messages';
import tracks from '../tracks';
import CTA from './CTA';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

const StyledAvatarBubbles = styled(AvatarBubbles)`
  min-height: 40px;
  margin-bottom: 30px;

  ${media.phone`
    margin-bottom: 30px;
  `}
`;

interface Props {
  fontColors: 'light' | 'dark';
  align?: TAlign;
}

export const getButtonStyle = (fontColors: 'light' | 'dark') => {
  switch (fontColors) {
    case 'light':
      return 'primary-inverse';
    case 'dark':
      return 'primary';
  }
};

const HeaderContent = ({
  align = 'center',
  fontColors,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: homepageSettings } = useHomepageSettings();
  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');

  const signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'signed-out header' },
    });
    triggerAuthenticationFlow();
  };
  const buttonStyle = getButtonStyle(fontColors);

  if (!isNilOrError(homepageSettings)) {
    const homepageAttributes = homepageSettings.data.attributes;
    const headerTitle = !isEmptyMultiloc(
      homepageAttributes.banner_signed_out_header_multiloc
    )
      ? localize(homepageAttributes.banner_signed_out_header_multiloc)
      : formatMessage(messages.titleCity);
    const headerSubtitle = !isEmptyMultiloc(
      homepageAttributes.banner_signed_out_subheader_multiloc
    )
      ? localize(homepageAttributes.banner_signed_out_subheader_multiloc)
      : formatMessage(messages.subtitleCity);
    const headerImage = homepageAttributes.header_bg
      ? homepageAttributes.header_bg.large
      : null;
    const hideAvatarsForThisLayout =
      isSmallerThanTablet &&
      homepageAttributes.banner_layout === 'fixed_ratio_layout';
    const displayHeaderAvatars =
      homepageAttributes.banner_avatars_enabled && !hideAvatarsForThisLayout;

    console.log({ displayHeaderAvatars });
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

        <CTA buttonStyle={buttonStyle} signUpIn={signUpIn} />
      </Container>
    );
  }

  return null;
};

export default injectIntl(HeaderContent);
