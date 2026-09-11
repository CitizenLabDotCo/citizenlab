import { Multiloc } from 'typings';

import { ICustomPageAttributes } from 'api/custom_pages/types';

// What a custom page banner shows. The legacy page builds it from its banner_* columns and
// the builder's banner widget stores it as node props, so neither side is the shape's owner.
export type CustomPageBannerContent = {
  layout: ICustomPageAttributes['banner_layout'];
  headerMultiloc: Multiloc;
  subheaderMultiloc: Multiloc;
  overlayColor: string | null;
  overlayOpacity: number | null;
  ctaType: ICustomPageAttributes['banner_cta_button_type'];
  ctaTextMultiloc: Multiloc;
  ctaUrl: string | null;
  imageUrl: string | null;
};
