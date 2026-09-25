import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import OptionPicker, { PickerOption } from '.';

const options: PickerOption<string>[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'On the homepage.',
    icon: 'eye',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only by link.',
    icon: 'eye-off',
  },
  { value: 'groups', label: 'Selected groups', icon: 'lock' },
];

const onChange = jest.fn();

const renderDropdown = (value = 'public', searchable = false) =>
  render(
    <OptionPicker
      title="Who can find it"
      description="Whether residents can discover this project."
      options={options}
      value={value}
      onChange={onChange}
      searchPlaceholder={searchable ? 'Search options' : undefined}
    />
  );

const trigger = () => screen.getByRole('button', { expanded: false });
const openTrigger = () => screen.getByRole('button', { expanded: true });

describe('OptionPicker', () => {
  beforeEach(() => onChange.mockClear());

  it('shows the selected option on the trigger', () => {
    renderDropdown('private');

    expect(trigger()).toHaveTextContent('Private');
  });

  it('opens on click and marks the selected option', async () => {
    renderDropdown();

    await userEvent.click(trigger());

    expect(screen.getByText('Who can find it')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Public/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Private/ })).not.toBeChecked();
  });

  it('reports the picked option and closes', async () => {
    renderDropdown();

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('radio', { name: /Private/ }));

    expect(onChange).toHaveBeenCalledWith('private');
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('closes on escape without picking anything', async () => {
    renderDropdown();

    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  describe('when it is searchable', () => {
    it('narrows the options down to what was typed', async () => {
      renderDropdown('public', true);

      await userEvent.click(trigger());
      await userEvent.type(
        screen.getByPlaceholderText('Search options'),
        'gro'
      );

      expect(
        screen.getByRole('radio', { name: /Selected groups/ })
      ).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: /Public/ })).toBeNull();
    });

    it('says so when nothing matches', async () => {
      renderDropdown('public', true);

      await userEvent.click(trigger());
      await userEvent.type(
        screen.getByPlaceholderText('Search options'),
        'zzz'
      );

      expect(screen.getByText('No results')).toBeInTheDocument();
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });

    it('starts from a clean search the next time it opens', async () => {
      renderDropdown('public', true);

      await userEvent.click(trigger());
      await userEvent.type(
        screen.getByPlaceholderText('Search options'),
        'gro'
      );
      await userEvent.click(openTrigger());
      await userEvent.click(trigger());

      expect(screen.getByPlaceholderText('Search options')).toHaveValue('');
      expect(screen.queryAllByRole('radio')).toHaveLength(3);
    });
  });
});
