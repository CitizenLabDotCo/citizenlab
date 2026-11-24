import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import TextField from '.';

describe('TextField', () => {
  it('is named by its label and described by its description', () => {
    render(<TextField label="Title" description="Shown on the project card" />);

    expect(
      screen.getByRole('textbox', { name: 'Title' })
    ).toHaveAccessibleDescription('Shown on the project card');
  });

  it('is described by its error instead of its description when invalid', () => {
    render(
      <TextField
        label="Title"
        description="Shown on the project card"
        errorMessage="A title is required"
        isInvalid
      />
    );

    const input = screen.getByRole('textbox', { name: 'Title' });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('A title is required');
  });
});
