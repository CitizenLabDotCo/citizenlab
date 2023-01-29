import React from 'react';
import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { render, screen } from 'utils/testUtils/rtl';

import LinearScaleControl from './LinearScaleControl';

jest.mock('utils/cl-intl');
jest.mock('services/locale');

const intl = getDummyIntlObject();
const handleChange = jest.fn();

const mockJSONSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    linear_scale: {
      type: 'number',
      minimum: 1,
      maximum: 5,
    },
  },
  required: ['linear_scale'],
};

const mockUISchema: any = {
  type: 'Control',
  scope: '#/properties/linear_scale',
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
  path: '#/properties/linear_scale',
  errors: '',
  schema: mockJSONSchema,
  rootSchema: mockJSONSchema,
  label: 'Linear scale',
  uischema: mockUISchema,
  id: '#/properties/linear_scale',
  enabled: true,
  visible: true,
};

describe('LinearScaleControl', () => {
  it('renders LinearScaleControl', () => {
    render(<LinearScaleControl {...props} />);
    expect(screen.getByTestId('linearScaleControl')).toBeInTheDocument();
  });
  it("doesn't show optional for required fields", () => {
    render(<LinearScaleControl {...props} />);
    expect(screen.queryByText('(optional)')).toBeNull();
  });
  it('shows optional for optional fields', () => {
    props.schema.required = [];
    render(<LinearScaleControl {...props} />);
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });
});
