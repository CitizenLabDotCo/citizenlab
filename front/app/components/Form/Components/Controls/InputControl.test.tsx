import React from 'react';

import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import { ErrorToReadProvider } from '../Fields/ErrorToReadContext';

import { InputControl } from './InputControl';

const intl = getDummyIntlObject();
const handleChange = jest.fn();

const mockJSONSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      minLength: 10,
      maxLength: 80,
    },
  },
};

const mockUISchema: any = {
  type: 'Control',
  label: 'Text',
  scope: 'text.en',
};
const mostProps = {
  intl,
  handleChange,
  path: 'text.en',
  errors: '',
  schema: mockJSONSchema.properties.text,
  rootSchema: mockUISchema,
  label: 'Text',
  uischema: mockUISchema,
  id: 'text.en',
  enabled: true,
  visible: true,
};

describe('InputControl', () => {
  it('renders InputControl', () => {
    render(
      <ErrorToReadProvider>
        <InputControl {...mostProps} data={undefined} />
      </ErrorToReadProvider>
    );
    expect(screen.getByTestId('inputControl')).toBeInTheDocument();
  });

  it('shows optional for optional fields', () => {
    render(
      <ErrorToReadProvider>
        <InputControl {...mostProps} data={undefined} />
      </ErrorToReadProvider>
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it("doesn't show optional for required fields", () => {
    render(
      <ErrorToReadProvider>
        <InputControl {...mostProps} data={undefined} required={true} />
      </ErrorToReadProvider>
    );
    expect(screen.queryByText('(optional)')).toBeNull();
  });

  it('shows the current data', () => {
    render(
      <ErrorToReadProvider>
        <InputControl {...mostProps} data="defined" />
      </ErrorToReadProvider>
    );
    expect(screen.getByRole('textbox')).toHaveValue('defined');
  });

  it("doesn't show an error when there is one but no interaction", () => {
    render(
      <ErrorToReadProvider>
        <InputControl
          {...mostProps}
          data={undefined}
          errors="We've got a problem"
        />
      </ErrorToReadProvider>
    );
    expect(screen.queryByText("We've got a problem")).toBeNull();
  });

  it('shows an error when there is one after blur', () => {
    render(
      <ErrorToReadProvider>
        <InputControl
          {...mostProps}
          data={undefined}
          errors="We've got a problem"
        />
      </ErrorToReadProvider>
    );
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.getByText("We've got a problem")).toBeInTheDocument();
  });

  it('calls on change with the right value', () => {
    render(
      <ErrorToReadProvider>
        <InputControl data={undefined} {...mostProps} />
      </ErrorToReadProvider>
    );

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'value',
      },
    });

    expect(handleChange).toHaveBeenCalledWith('text.en', 'value');
  });
});
