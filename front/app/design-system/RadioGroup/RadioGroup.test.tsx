import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import RadioGroup, { Radio } from '.';

describe('Radio with a disabled reason', () => {
  it('is marked disabled and cannot be chosen', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <RadioGroup label="Who can see it" value="everyone" onChange={onChange}>
        <Radio value="everyone">Everyone</Radio>
        <Radio value="groups" disabledReason="No groups exist yet">
          Selected groups
        </Radio>
      </RadioGroup>
    );

    const radio = screen.getByRole('radio', { name: 'Selected groups' });
    await user.click(radio);

    expect(radio).toHaveAttribute('aria-disabled', 'true');
    expect(radio).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });
});
