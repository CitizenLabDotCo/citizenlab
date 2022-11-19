import React from 'react';
import BannerImageFields from './BannerImageFields';
import { render, screen } from 'utils/testUtils/rtl';

jest.mock('utils/cl-intl');

// note: this component mostly relies on an image retrieved from the server/aws
// so most testing should be done in e2e tests

describe('BannerImageFields', () => {
  it('renders properly', () => {
    render(
      <BannerImageFields
        bannerOverlayColor={'#fff'}
        bannerOverlayOpacity={90}
        bannerLayout="full_width_banner_layout"
        headerBg={{
          small: 'url',
          medium: 'medium',
          large: 'http://www.fakeserver.com/testimage.png',
        }}
        onAddImage={jest.fn()}
        onRemoveImage={jest.fn()}
        setFormStatus={jest.fn()}
        onOverlayColorChange={jest.fn()}
        onOverlayOpacityChange={jest.fn()}
      />
    );

    expect(screen.getByText('Header image')).toBeInTheDocument();
  });
});
