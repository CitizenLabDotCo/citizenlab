import { Multiloc } from 'typings';

import { ICustomPageAttributes } from 'api/custom_pages/types';

// Built from a page's banner_* columns, or from the builder banner widget's props.
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
