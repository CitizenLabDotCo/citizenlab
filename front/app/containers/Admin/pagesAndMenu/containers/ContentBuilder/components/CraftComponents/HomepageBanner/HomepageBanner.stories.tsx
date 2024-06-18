import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

import { loggedOutHandler } from 'api/me/__mocks__/_mockServer';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import HomepageBanner from '.';

import type { Meta, StoryObj } from '@storybook/react';

import { getOrigin } from 'utils/storybook/getOrigin';

const meta = {
  title: 'Core/HomepageBanner',
  component: HomepageBanner,
  render: (props) => (
    <Box w="800px">
      <HomepageBanner {...props} />
    </Box>
  ),
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof HomepageBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

const imageUrl = `${getOrigin()}/images/image16.png`;

export const LoggedOut: Story = {
  args: {
    homepageSettings: {
      banner_layout: 'full_width_banner_layout',
      // signed_out
      banner_signed_out_header_multiloc: { en: 'Header' },
      banner_signed_out_subheader_multiloc: { en: 'Subheader' },
      banner_signed_out_header_overlay_color: '#013220',
      // Number between 0 and 100, inclusive
      banner_signed_out_header_overlay_opacity: 70,
      banner_avatars_enabled: false,
      // cta_signed_out
      banner_cta_signed_out_text_multiloc: { en: 'Signed out' },
      banner_cta_signed_out_type: 'sign_up_button',
      banner_cta_signed_out_url: null,
      // signed_in
      banner_signed_in_header_multiloc: { en: 'Signed in' },
      banner_signed_in_header_overlay_color: '#013220',
      // Number between 0 and 100, inclusive
      banner_signed_in_header_overlay_opacity: 70,
      // cta_signed_in
      banner_cta_signed_in_text_multiloc: { en: 'Signed in text' },
      banner_cta_signed_in_type: 'no_button',
      banner_cta_signed_in_url: null,
      header_bg: null,
    },
    image: { imageUrl },
  },
  parameters: {
    msw: mockEndpoints({
      'GET users/me': loggedOutHandler,
    }),
  },
};
