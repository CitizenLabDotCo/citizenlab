import {
  Container,
  getAlignItems,
  HeaderSubtitle,
  HeaderTitle,
  TAlign,
} from 'components/LandingPages/citizen/HeaderContent';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import BannerButton from 'components/LandingPages/citizen/BannerButton';
import { ICustomPageAttributes } from 'services/customPages';

interface Props {
  fontColors: 'light' | 'dark';
  align?: TAlign;
  hasHeaderBannerImage: boolean;
  pageAttributes: ICustomPageAttributes;
}

const HeaderContent = ({
  align = 'center',
  fontColors,
  hasHeaderBannerImage,
  pageAttributes,
}: Props) => {
  const localize = useLocalize();

  const formattedHeaderTitle = localize(pageAttributes.banner_header_multiloc);
  const formattedSubheaderTitle = localize(
    pageAttributes.banner_subheader_multiloc
  );

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
      {pageAttributes.banner_cta_button_type === 'customized_button' && (
        <BannerButton
          buttonStyle={fontColors === 'light' ? 'primary-inverse' : 'primary'}
          text={localize(pageAttributes.banner_cta_button_multiloc)}
          linkTo={pageAttributes.banner_cta_button_url}
          openLinkInNewTab={true}
        />
      )}
    </Container>
  );
};

export default HeaderContent;
