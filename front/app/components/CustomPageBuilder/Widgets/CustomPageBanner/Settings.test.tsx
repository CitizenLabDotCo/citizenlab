import React from 'react';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import Settings from './Settings';
import { CustomPageBannerProps } from './types';

const banner: CustomPageBannerProps = {
  layout: 'full_width_banner_layout',
  headerMultiloc: { en: 'Welcome' },
  subheaderMultiloc: {},
  overlayColor: '#123456',
  overlayOpacity: 60,
  ctaType: 'no_button',
  ctaTextMultiloc: {},
  ctaUrl: null,
  image: {},
};

// setProp hands the mutator the node's current props, as craftjs does.
let props: CustomPageBannerProps;
const mockSetProp = jest.fn((change: (props: CustomPageBannerProps) => void) =>
  change(props)
);
jest.mock('@craftjs/core', () => ({
  useNode: (collect: (node: { data: { props: unknown } }) => object) => ({
    ...collect({ data: { props } }),
    actions: { setProp: mockSetProp },
  }),
}));

const mockAddContentBuilderImage = jest.fn(() =>
  Promise.resolve({
    data: {
      attributes: { code: 'img-code', image_url: 'https://cdn/img.jpg' },
    },
  })
);
jest.mock('api/content_builder_images/useAddContentBuilderImage', () =>
  jest.fn(() => ({ mutateAsync: mockAddContentBuilderImage }))
);
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

describe('CustomPageBannerSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    props = { ...banner };
  });

  // The image goes through the layout-images endpoint like every builder image, so the node
  // stores a code the serializer can render a URL from.
  it('uploads a picked image and stores its code', async () => {
    render(<Settings />);

    const input = screen.getByTestId('dropzone-input');
    const file = new File(['x'], 'header.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockAddContentBuilderImage).toHaveBeenCalled());
    await waitFor(() =>
      expect(props.image).toEqual({
        dataCode: 'img-code',
        imageUrl: 'https://cdn/img.jpg',
      })
    );
  });
});
