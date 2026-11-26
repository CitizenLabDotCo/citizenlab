import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ComboBox from '../ComboBox';
import Select from '../Select';

import { ListBoxOption } from '.';

describe.each([{ Field: Select }, { Field: ComboBox }])(
  'options with a disabled reason',
  ({ Field }) => {
    it('shows the reason and only selects enabled options', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <Field label="Status" onChange={onChange}>
          <ListBoxOption id="new">New</ListBoxOption>
          <ListBoxOption id="done" disabledReason="Not for this phase">
            Done
          </ListBoxOption>
        </Field>
      );

      await user.click(screen.getByRole('button', { name: /Status$/ }));
      const disabledOption = await screen.findByRole('option', {
        name: 'Done',
      });
      expect(disabledOption).toHaveAccessibleDescription('Not for this phase');

      await user.click(disabledOption);
      expect(onChange).not.toHaveBeenCalled();

      if (!screen.queryByRole('option', { name: 'New' })) {
        await user.click(screen.getByRole('button', { name: /Status$/ }));
      }
      await user.click(await screen.findByRole('option', { name: 'New' }));
      expect(onChange).toHaveBeenCalledWith('new');
    });
  }
);
