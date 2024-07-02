import React from 'react';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

import LayoutSettingField from './';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

describe('LayoutSettingField', () => {
  it('renders with the proper radio button checked', () => {
    render(
      <LayoutSettingField
        bannerLayout={'full_width_banner_layout'}
        onChange={jest.fn()}
      />
    );

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('two_column_layout option is visible when the banner layout is two_column_layout', async () => {
    const onChange = jest.fn();

    render(
      <LayoutSettingField
        bannerLayout={'two_column_layout'}
        onChange={onChange}
      />
    );

    await waitFor(() => {
      screen.getAllByRole('radio')[0].click();
    });

    await waitFor(() => {
      screen.getAllByRole('radio')[2].click();
    });

    await waitFor(() => {
      screen.getAllByRole('radio')[3].click();
    });

    expect(onChange).toHaveBeenCalledTimes(3);

    expect(onChange).toHaveBeenCalledWith('full_width_banner_layout');
    expect(onChange).toHaveBeenCalledWith('two_row_layout');
    expect(onChange).toHaveBeenCalledWith('fixed_ratio_layout');
  });

  it('two_column_layout option is hidden when the banner layout is not two_column_layout option', async () => {
    const onChange = jest.fn();

    render(
      <LayoutSettingField
        bannerLayout={'full_width_banner_layout'}
        onChange={onChange}
      />
    );

    await waitFor(() => {
      screen.getAllByRole('radio')[1].click();
    });

    await waitFor(() => {
      screen.getAllByRole('radio')[2].click();
    });

    expect(onChange).toHaveBeenCalledTimes(2);

    expect(onChange).toHaveBeenCalledWith('two_row_layout');
    expect(onChange).toHaveBeenCalledWith('fixed_ratio_layout');
  });
});
