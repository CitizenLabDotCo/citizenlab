import React from 'react';
import LayoutSettingField from './';
import { render, screen, waitFor } from 'utils/testUtils/rtl';

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

  it('calls the onChange handler properly', async () => {
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
    expect(onChange).toHaveBeenCalledWith('two_column_layout');
    expect(onChange).toHaveBeenCalledWith('two_row_layout');
  });
});
