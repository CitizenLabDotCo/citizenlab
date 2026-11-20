import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, fireEvent, userEvent } from 'utils/testUtils/rtl';

import Rating from './Rating';

const question: IFlatCustomField = {
  id: 'quality-id',
  type: 'custom_field',
  key: 'quality',
  title_multiloc: { en: 'How good is the square today?' },
  description_multiloc: {},
  input_type: 'rating',
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  maximum: 5,
};

// The stars are hidden from screen readers, so a star is found by the number
// shown under it
const star = (value: number) => screen.getByText(String(value));

describe('Rating', () => {
  it('selects a star by click and by arrow key', async () => {
    const onChange = jest.fn();
    render(<Rating question={question} value={3} onChange={onChange} />);

    await userEvent.click(star(4));
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });

    expect(onChange).toHaveBeenNthCalledWith(1, 4);
    expect(onChange).toHaveBeenNthCalledWith(2, 4);
  });

  it('ignores clicks and arrow keys and takes no tab stop when disabled', async () => {
    const onChange = jest.fn();
    render(
      <Rating question={question} value={3} onChange={onChange} disabled />
    );

    await userEvent.click(star(4));
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('slider')).not.toHaveAttribute('tabindex');
  });
});
