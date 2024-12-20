import React from 'react';

import { useBreakpoint, media } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useLocalize from 'hooks/useLocalize';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import AvatarBubbles from 'components/AvatarBubbles';
import {
  Container,
  getAlignItems,
  HeaderSubtitle,
  HeaderTitle,
  TAlign,
} from 'components/LandingPages/citizen/HeaderContent';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';
import { isEmptyMultiloc, isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import tracks from '../tracks';

import CTA from './CTA';

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
  homepageSettings: Partial<IHomepageBannerSettings>;
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
  homepageSettings,
}: Props & WrappedComponentProps) => {
  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');

  const signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'signed-out header' },
    });
    triggerAuthenticationFlow({}, 'signup');
  };
  const buttonStyle = getButtonStyle(fontColors);

  if (!isNilOrError(homepageSettings)) {
    const headerTitle =
      homepageSettings.banner_signed_out_header_multiloc &&
      !isEmptyMultiloc(homepageSettings.banner_signed_out_header_multiloc)
        ? localize(homepageSettings.banner_signed_out_header_multiloc)
        : formatMessage(messages.titleCity);
    const headerSubtitle =
      homepageSettings.banner_signed_out_subheader_multiloc &&
      !isEmptyMultiloc(homepageSettings.banner_signed_out_subheader_multiloc)
        ? localize(homepageSettings.banner_signed_out_subheader_multiloc)
        : formatMessage(messages.subtitleCity);
    const headerImage = homepageSettings.header_bg
      ? homepageSettings.header_bg.large
      : null;
    const hideAvatarsForThisLayout =
      isSmallerThanTablet &&
      homepageSettings.banner_layout === 'fixed_ratio_layout';
    const displayHeaderAvatars =
      homepageSettings.banner_avatars_enabled && !hideAvatarsForThisLayout;

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
          variant="h2"
          hasHeader={!!headerImage}
          className="e2e-signed-out-header-subtitle"
          fontColors={fontColors}
          align={align}
          displayHeaderAvatars={displayHeaderAvatars}
        >
          {headerSubtitle}
        </HeaderSubtitle>

        {displayHeaderAvatars && (
          <StyledAvatarBubbles showParticipantText={false} />
        )}

        <CTA
          buttonStyle={buttonStyle}
          signUpIn={signUpIn}
          homepageSettings={homepageSettings}
        />
      </Container>
    );
  }

  return null;
};

export default injectIntl(HeaderContent);
