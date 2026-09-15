import { ICustomPageAttributes } from 'api/custom_pages/types';

import { CustomPageBannerContent } from 'components/CustomPageHeader/types';

// The legacy render path: the banner as the page's own columns describe it. Under builder
// content the layout's banner widget carries the same shape in its props instead.
const bannerContentFromPage = (
  attributes: ICustomPageAttributes
): CustomPageBannerContent => ({
  layout: attributes.banner_layout,
  headerMultiloc: attributes.banner_header_multiloc,
  subheaderMultiloc: attributes.banner_subheader_multiloc,
  overlayColor: attributes.banner_overlay_color,
  overlayOpacity: attributes.banner_overlay_opacity,
  ctaType: attributes.banner_cta_button_type,
  ctaTextMultiloc: attributes.banner_cta_button_multiloc,
  ctaUrl: attributes.banner_cta_button_url,
  // Every banner layout renders the large size and nothing else.
  imageUrl: attributes.header_bg?.large ?? null,
});

export default bannerContentFromPage;
