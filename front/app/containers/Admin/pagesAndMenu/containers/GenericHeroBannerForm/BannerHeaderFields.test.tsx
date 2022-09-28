import React from 'react';
import BannerHeaderFields from './BannerHeaderFields';
import { render, screen, waitFor, fireEvent } from 'utils/testUtils/rtl';

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

describe('BannerHeaderFields', () => {
  it('renders with correctly displayed text', () => {
    render(
      <BannerHeaderFields
        bannerHeaderMultiloc={{ en: 'banner header' }}
        bannerSubheaderMultiloc={{ en: 'banner subheader' }}
        onHeaderChange={jest.fn()}
        onSubheaderChange={jest.fn()}
        title={'banner header fields'}
        inputLabelText={'header input label text'}
        subheaderInputLabelText={'subheader input label text'}
      />
    );

    expect(screen.getByText('banner header fields')).toBeInTheDocument();
    expect(screen.getByDisplayValue('banner subheader')).toBeInTheDocument();
  });

  it('calls onChange handlers properly', async () => {
    const onHeaderChange = jest.fn();
    const onSubheaderChange = jest.fn();

    render(
      <BannerHeaderFields
        bannerHeaderMultiloc={{ en: 'banner header' }}
        bannerSubheaderMultiloc={{ en: 'banner subheader' }}
        onHeaderChange={onHeaderChange}
        onSubheaderChange={onSubheaderChange}
        title={'banner header fields'}
        inputLabelText={'header input label text'}
        subheaderInputLabelText={'subheader input label text'}
      />
    );

    await waitFor(() => {
      fireEvent.change(screen.getByDisplayValue('banner header'), {
        target: {
          value: 'new banner header',
        },
      });
    });

    fireEvent.change(screen.getByDisplayValue('banner subheader'), {
      target: {
        value: 'new banner subheader',
      },
    });

    expect(onHeaderChange).toHaveBeenCalledWith({ en: 'new banner header' });
    expect(onSubheaderChange).toHaveBeenCalledWith({
      en: 'new banner subheader',
    });
  });

  it('does not accept too-long strings', async () => {
    const onHeaderChange = jest.fn();
    const stringWith46Chars = 'cmBWChcCoQuVNCrFq9sSXCKMwOwSYZyHZnRyvfGyDTrSTi';
    const stringWith44Chars = 'LMt6Yqokmgq6XQNVkhjeMNcpjPVl3qe6CF0aePClNKuV';

    render(
      <BannerHeaderFields
        bannerHeaderMultiloc={{ en: 'banner header' }}
        bannerSubheaderMultiloc={{ en: 'banner subheader' }}
        onHeaderChange={onHeaderChange}
        onSubheaderChange={jest.fn()}
        title={'banner header fields'}
        inputLabelText={'header input label text'}
        subheaderInputLabelText={'subheader input label text'}
      />
    );

    await waitFor(() => {
      fireEvent.change(screen.getByDisplayValue('banner header'), {
        target: {
          value: stringWith46Chars,
        },
      });
    });

    await waitFor(() => {
      fireEvent.change(screen.getByDisplayValue('banner header'), {
        target: {
          value: stringWith44Chars,
        },
      });
    });

    expect(onHeaderChange).toHaveBeenCalledTimes(1);
    expect(onHeaderChange).toHaveBeenCalledWith({ en: stringWith44Chars });
  });
});
