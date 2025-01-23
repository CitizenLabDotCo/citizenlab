import React from 'react';

import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { render, screen } from 'utils/testUtils/rtl';

import { ErrorToReadProvider } from '../Fields/ErrorToReadContext';

import LinearScaleControl from './LinearScaleControl';

const intl = getDummyIntlObject();
const handleChange = jest.fn();

const mockJSONSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    rating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
    },
  },
  required: ['rating'],
};

const mockUISchema: any = {
  type: 'Control',
  scope: '#/properties/rating',
  label: 'Linear scale',
  options: {
    description: '',
    minimum_label: 'Strongly disagree',
    maximum_label: 'Strongly agree',
  },
};

const props = {
  intl,
  handleChange,
  path: '#/properties/rating',
  errors: '',
  schema: mockJSONSchema,
  rootSchema: mockJSONSchema,
  label: 'Linear scale',
  uischema: mockUISchema,
  id: '#/properties/rating',
  enabled: true,
  visible: true,
};

describe('LinearScaleControl', () => {
  it('renders LinearScaleControl', () => {
    render(
      <ErrorToReadProvider>
        <LinearScaleControl {...props} />
      </ErrorToReadProvider>
    );
    expect(screen.getByTestId('linearScaleControl')).toBeInTheDocument();
  });

  it("doesn't show optional for required fields", () => {
    render(
      <ErrorToReadProvider>
        <LinearScaleControl {...props} />
      </ErrorToReadProvider>
    );
    expect(screen.queryByText('(optional)')).toBeNull();
  });

  it('shows optional for optional fields', () => {
    props.schema.required = [];
    render(
      <ErrorToReadProvider>
        <LinearScaleControl {...props} />
      </ErrorToReadProvider>
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });
});
