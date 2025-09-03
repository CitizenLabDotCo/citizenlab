import React from 'react';

import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { render, screen } from 'utils/testUtils/rtl';

import { ErrorToReadProvider } from '../Fields/ErrorToReadContext';

import RatingControl from './RatingControl';

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
  label: 'Rating field',
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
  label: 'Rating field',
  uischema: mockUISchema,
  id: '#/properties/rating',
  enabled: true,
  visible: true,
};

describe('RatingControl', () => {
  it('renders RatingControl', () => {
    render(
      <ErrorToReadProvider>
        <RatingControl {...props} />
      </ErrorToReadProvider>
    );
    expect(screen.getByTestId('ratingControl')).toBeInTheDocument();
  });

  it("doesn't show optional for required fields", () => {
    render(
      <ErrorToReadProvider>
        <RatingControl {...props} />
      </ErrorToReadProvider>
    );
    expect(screen.queryByText('(optional)')).toBeNull();
  });

  it('shows optional for optional fields', () => {
    props.schema.required = [];
    render(
      <ErrorToReadProvider>
        <RatingControl {...props} />
      </ErrorToReadProvider>
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });
});
