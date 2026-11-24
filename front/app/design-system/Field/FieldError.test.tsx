import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import TextField from '../TextField';

import { FieldError } from '.';

it('describes a React Aria field with its validation message', () => {
  render(
    <TextField label="Title" isInvalid errorMessage="Enter a project title." />
  );

  expect(
    screen.getByRole('textbox', { name: 'Title' })
  ).toHaveAccessibleDescription('Enter a project title.');
});

it('exposes an error id for controls that manage their own descriptions', () => {
  render(
    <>
      <button aria-describedby="date-error">Dates</button>
      <FieldError id="date-error">Choose an end date.</FieldError>
    </>
  );

  expect(
    screen.getByRole('button', { name: 'Dates' })
  ).toHaveAccessibleDescription('Choose an end date.');
});
