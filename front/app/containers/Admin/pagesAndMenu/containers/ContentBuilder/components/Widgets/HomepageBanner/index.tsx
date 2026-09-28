import React, { lazy } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { ImageSizes, Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';

import useLocale from 'hooks/useLocale';

import SignedInHeader from 'containers/HomePage/SignedInHeader';
import SignedOutHeader from 'containers/HomePage/SignedOutHeader';

import { useLocation, useSearch } from 'utils/router';

import { DEFAULT_Y_PADDING } from '../constants';

import messages from './messages';

// Lazy, as the settings (image upload, cropping, rich inputs) are only needed in
// the builder, not on the homepage.
const Settings = lazy(() => import('./Settings'));

export type THomepageBannerLayout =
  THomepageBannerLayoutMap[keyof THomepageBannerLayoutMap];

export interface THomepageBannerLayoutMap {
  full_width_banner_layout: 'full_width_banner_layout';
  two_column_layout: 'two_column_layout';
  two_row_layout: 'two_row_layout';
  fixed_ratio_layout: 'fixed_ratio_layout';
}

interface CTASignedInTypeMap {
  customized_button: 'customized_button';
  no_button: 'no_button';
}

export type CTASignedInType = CTASignedInTypeMap[keyof CTASignedInTypeMap];

interface CTASignedOutTypeMap {
  sign_up_button: 'sign_up_button';
  customized_button: 'customized_button';
  no_button: 'no_button';
}
export type CTASignedOutType = CTASignedOutTypeMap[keyof CTASignedOutTypeMap];

export interface IHomepageBannerSettings {
  banner_layout: THomepageBannerLayout;
  // signed_out
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  banner_signed_out_header_overlay_color: string | null;
  // Number between 0 and 100, inclusive
  banner_signed_out_header_overlay_opacity: number | null;
  banner_avatars_enabled: boolean;
  // cta_signed_out
  banner_cta_signed_out_text_multiloc: Multiloc;
  banner_cta_signed_out_type: CTASignedOutType;
  banner_cta_signed_out_url: string | null;
  // signed_in
  banner_signed_in_header_multiloc: Multiloc;
  banner_signed_in_header_overlay_color?: string | null;
  // Number between 0 and 100, inclusive
  banner_signed_in_header_overlay_opacity?: number | null;
  // signed_in header heights (in pixels)
  banner_signed_in_header_height_desktop?: number;
  banner_signed_in_header_height_tablet?: number;
  banner_signed_in_header_height_phone?: number;
  // signed_out header heights (in pixels)
  banner_signed_out_header_height_desktop?: number;
  banner_signed_out_header_height_tablet?: number;
  banner_signed_out_header_height_phone?: number;
  // use same height for both banners
  banner_use_consistent_height?: boolean;
  // cta_signed_in
  banner_cta_signed_in_text_multiloc: Multiloc;
  banner_cta_signed_in_type: CTASignedInType;
  banner_cta_signed_in_url: string | null;
  header_bg?: ImageSizes | null;
}

export type ErrorType =
  | 'banner_cta_signed_out_url'
  | 'banner_cta_signed_in_url';

export type Props = {
  homepageSettings: IHomepageBannerSettings;
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
  hasError?: boolean;
  errors?: ErrorType[];
};

const HomepageBanner = ({ homepageSettings, image }: Props) => {
  const { pathname } = useLocation();
  const { data: authUser } = useAuthUser();
  const search = useSearch({ strict: false });
  const locale = useLocale();
  const isSmallerThanPhone = useBreakpoint('phone');

  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const showSignedInHeader =
    (isHomepage && authUser?.data !== undefined) ||
    search.variant === 'signedIn';

  return (
    <Box
      data-cy="e2e-homepage-banner"
      mb={isSmallerThanPhone ? DEFAULT_Y_PADDING : '40px'}
    >
      {showSignedInHeader ? (
        <SignedInHeader
          homepageSettings={{
            ...homepageSettings,
            header_bg: {
              large: image?.imageUrl || null,
              medium: image?.imageUrl || null,
              small: image?.imageUrl || null,
            },
          }}
          isContentBuilderDisplay={!isHomepage}
        />
      ) : (
        <SignedOutHeader
          homepageSettings={{
            ...homepageSettings,
            header_bg: {
              large: image?.imageUrl || null,
              medium: image?.imageUrl || null,
              small: image?.imageUrl || null,
            },
          }}
        />
      )}
    </Box>
  );
};

HomepageBanner.craft = {
  props: {
    homepageSettings: {
      banner_signed_out_header_multiloc: {},
      banner_signed_out_subheader_multiloc: {},
      banner_avatars_enabled: true,
    },
  },
  related: {
    settings: Settings,
  },
  rules: {
    canDrag: () => false,
  },
};

export const homepageBannerTitle = messages.homepageBannerTitle;

export default HomepageBanner;
