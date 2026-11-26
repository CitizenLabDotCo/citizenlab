import React from 'react';

import fetchLocationOptions from 'components/UI/LocationInput/fetchLocationOptions';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import LocationComboBox from './LocationComboBox';

jest.mock('components/UI/LocationInput/fetchLocationOptions');

it('ignores responses from earlier queries while the latest search is debouncing', async () => {
  jest.useFakeTimers();

  try {
    let resolveSearch: (
      options: { label: string; value: string }[]
    ) => void = () => undefined;
    const pendingSearch = new Promise<{ label: string; value: string }[]>(
      (resolve) => {
        resolveSearch = resolve;
      }
    );
    jest.mocked(fetchLocationOptions).mockReturnValueOnce(pendingSearch);
    jest
      .mocked(fetchLocationOptions)
      .mockResolvedValueOnce([
        { label: 'Paris, France', value: 'Paris, France' },
      ]);

    render(
      <LocationComboBox
        label="Location"
        placeholder="Search"
        value=""
        onChange={jest.fn()}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Location' });
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'Par' } });
    act(() => jest.advanceTimersByTime(500));

    fireEvent.change(input, { target: { value: 'Paris' } });
    await act(async () =>
      resolveSearch([{ label: 'Parma, Italy', value: 'Parma, Italy' }])
    );
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(
      screen.queryByRole('option', { name: 'Parma, Italy' })
    ).not.toBeInTheDocument();

    await act(async () => jest.advanceTimersByTime(500));
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(
      screen.getByRole('option', { name: 'Paris, France' })
    ).toBeInTheDocument();
  } finally {
    jest.useRealTimers();
  }
});
