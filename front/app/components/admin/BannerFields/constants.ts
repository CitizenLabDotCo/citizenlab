import { TCustomPageBannerLayout } from 'api/custom_pages/types';

import { TDevice } from 'components/admin/SelectPreviewDevice';

// move this to homepage settings resource?
export const FIXED_RATIO_LAYOUT_ASPECT_RATIO = 3 / 1;
export const homepageBannerLayoutHeights: {
  [key in TCustomPageBannerLayout]: {
    [key in TDevice]: number;
  };
} = {
  full_width_banner_layout: {
    phone: 350,
    tablet: 350,
    desktop: 450,
  },
  two_column_layout: {
    phone: 240,
    tablet: 532,
    desktop: 532,
  },
  two_row_layout: {
    phone: 200,
    tablet: 280,
    desktop: 280,
  },
  fixed_ratio_layout: {
    // On mobile min-height is 225.
    phone: 225,
    // We define a screen as tablet when width is between 769 and 1200 px.
    // Height will start reducing from our max width of 1200px.
    // We maintain the 3:1 aspect ratio until our min-height of 225px is reached.
    // At this point, the banner will start cutting of from the size to maintain
    // the min-height.
    // So for the fixed-ratio layout, it makes sense to show the same preview for tablet
    // as for desktop
    tablet: 383,
    // Header image is saved as 1920x640px.
    // Image is displayed with max width 1200px and 3:1 aspect ratio.
    // This means width of 383.33px.
    desktop: 383,
  },
};
