import React from 'react';
import useLocalize from 'hooks/useLocalize';
import {
  Container,
  HeaderTitle,
  HeaderSubtitle,
  TAlign,
  getAlignItems,
  // getButtonStyle,
} from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import BannerButton from // BannerButtonStyle,
'containers/LandingPage/BannerButton';

interface Props {
  fontColors: 'light' | 'dark';
  align?: TAlign;
  headerMultiloc: Multiloc;
  subheaderMultiloc: Multiloc;
  hasHeaderBannerImage: boolean;
  ctaButtonType: 'customized_button' | 'no_button';
  ctaButtonUrl: string | null;
  ctaButtonMultiloc: Multiloc;
}

const HeaderContent = ({
  align = 'center',
  fontColors,
  headerMultiloc,
  subheaderMultiloc,
  hasHeaderBannerImage,
  ctaButtonType,
  ctaButtonUrl,
  ctaButtonMultiloc,
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  const formattedHeaderTitle = headerMultiloc
    ? localize(headerMultiloc)
    : 'Placeholder: no header multiloc';

  const formattedSubheaderTitle = subheaderMultiloc
    ? localize(subheaderMultiloc)
    : 'Placeholder: no subheader multiloc';

  return (
    <Container
      id="hook-header-content"
      className="e2e-signed-out-header-title"
      alignTo={getAlignItems(align)}
      align={align}
    >
      <HeaderTitle
        hasHeader={hasHeaderBannerImage}
        fontColors={fontColors}
        align={align}
      >
        {formattedHeaderTitle}
      </HeaderTitle>

      <HeaderSubtitle
        hasHeader={hasHeaderBannerImage}
        className="e2e-signed-out-header-subtitle"
        displayHeaderAvatars={false}
        fontColors={fontColors}
        align={align}
      >
        {formattedSubheaderTitle}
      </HeaderSubtitle>
      {ctaButtonType === 'customized_button' && (
        <BannerButton
          buttonStyle="primary"
          text={localize(ctaButtonMultiloc)}
          linkTo={ctaButtonUrl}
          openLinkInNewTab={true}
        />
      )}
    </Container>
  );
};

export default injectIntl(HeaderContent);
