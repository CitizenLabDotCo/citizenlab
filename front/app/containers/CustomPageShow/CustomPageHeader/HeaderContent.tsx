import React from 'react';
import useLocalize from 'hooks/useLocalize';
import {
  Container,
  HeaderTitle,
  HeaderSubtitle,
  TAlign,
  getAlignItems,
} from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import BannerButton from 'containers/LandingPage/BannerButton';
import { ICustomPageAttributes } from 'services/staticPages';

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
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  const formattedHeaderTitle = pageAttributes.banner_header_multiloc
    ? localize(pageAttributes.banner_header_multiloc)
    : 'Placeholder: no header multiloc';

  const formattedSubheaderTitle = pageAttributes.banner_subheader_multiloc
    ? localize(pageAttributes.banner_subheader_multiloc)
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

export default injectIntl(HeaderContent);
