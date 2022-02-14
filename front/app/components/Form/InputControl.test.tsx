import React from 'react';
import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import { InputControl } from './InputControl';

jest.mock('utils/cl-intl');
jest.mock('services/locale');

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

const mockUISchema = {
  type: 'Control' as 'Control',
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
    render(<InputControl {...mostProps} data={undefined} />);
    expect(screen.getByTestId('inputControl')).toBeInTheDocument();
  });

  it('shows opional for optional fields', () => {
    render(<InputControl {...mostProps} data={undefined} />);
    expect(screen.getByText('optional')).toBeInTheDocument();
  });

  it("doesn't show opional for reuqired fields", () => {
    render(<InputControl {...mostProps} data={undefined} required={true} />);
    expect(screen.queryByText('optional')).toBeNull();
  });

  it('shows the current data', () => {
    render(<InputControl {...mostProps} data="defined" />);
    expect(screen.getByRole('textbox')).toHaveValue('defined');
  });

  it("doesn't show an error when there is one but no interaction", () => {
    render(
      <InputControl
        {...mostProps}
        data={undefined}
        errors="We've got a problem"
      />
    );
    expect(screen.queryByText("We've got a problem")).toBeNull();
  });

  it('shows an error when there is one after blur', () => {
    render(
      <InputControl
        {...mostProps}
        data={undefined}
        errors="We've got a problem"
      />
    );
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.getByText("We've got a problem")).toBeInTheDocument();
  });

  it('calls on change with the right value', () => {
    render(<InputControl data={undefined} {...mostProps} />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'value',
      },
    });

    expect(handleChange).toHaveBeenCalledWith('text.en', 'value');
  });
});
