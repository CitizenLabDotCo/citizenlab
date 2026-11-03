import React from 'react';

import useLocalize from 'hooks/useLocalize';

import BannerButton from 'components/LandingPages/citizen/BannerButton';
import {
  Container,
  getAlignItems,
  HeaderSubtitle,
  HeaderTitle,
  TAlign,
} from 'components/LandingPages/citizen/HeaderContent';

import { CustomPageBannerContent } from './types';

interface Props {
  fontColors: 'light' | 'dark';
  align?: TAlign;
  hasHeaderBannerImage: boolean;
  banner: CustomPageBannerContent;
}

const HeaderContent = ({
  align = 'center',
  fontColors,
  hasHeaderBannerImage,
  banner,
}: Props) => {
  const localize = useLocalize();

  const formattedHeaderTitle = localize(banner.headerMultiloc);
  const formattedSubheaderTitle = localize(banner.subheaderMultiloc);

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
        variant="h2"
        hasHeader={hasHeaderBannerImage}
        className="e2e-signed-out-header-subtitle"
        displayHeaderAvatars={false}
        fontColors={fontColors}
        align={align}
      >
        {formattedSubheaderTitle}
      </HeaderSubtitle>
      {banner.ctaType === 'customized_button' && (
        <BannerButton
          buttonStyle={fontColors === 'light' ? 'primary-inverse' : 'primary'}
          text={localize(banner.ctaTextMultiloc)}
          linkTo={banner.ctaUrl}
          openLinkInNewTab={true}
        />
      )}
    </Container>
  );
};

export default HeaderContent;
