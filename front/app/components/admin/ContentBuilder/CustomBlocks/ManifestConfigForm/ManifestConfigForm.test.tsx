import React from 'react';

import { BlockConfigField } from 'api/custom_blocks/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ManifestConfigForm from './index';

// The real hook needs the tenant locales from the app configuration, which is
// not fetched in tests.
jest.mock('hooks/useLocalize', () =>
  jest.fn(() => (multiloc?: { en?: string }) => multiloc?.en ?? '')
);

// InputMultilocWithLocaleSwitcher renders nothing until it knows the tenant
// locales, which normally come from the app configuration request.
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

const schema: BlockConfigField[] = [
  { key: 'heading', type: 'text', label: { en: 'Heading' } },
  {
    key: 'max_items',
    type: 'number',
    label: { en: 'Max items' },
    default: 3,
  },
  {
    key: 'show_counter',
    type: 'boolean',
    label: { en: 'Show counter' },
    default: false,
  },
  {
    key: 'intro',
    type: 'multiloc_text',
    label: { en: 'Intro' },
  },
  {
    key: 'sort_order',
    type: 'select',
    label: { en: 'Sort order' },
    options: [
      { value: 'recent', label: { en: 'Most recent' } },
      { value: 'popular', label: { en: 'Most popular' } },
    ],
  },
];

describe('ManifestConfigForm', () => {
  it('renders a text field with a localized label', () => {
    render(
      <ManifestConfigForm schema={schema} values={{}} onChange={jest.fn()} />
    );

    expect(screen.getByLabelText('Heading')).toBeInTheDocument();
  });

  it('shows the schema default when no value is set, without calling onChange', () => {
    const onChange = jest.fn();

    render(
      <ManifestConfigForm schema={schema} values={{}} onChange={onChange} />
    );

    expect(screen.getByLabelText('Max items')).toHaveValue(3);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with the field key and the typed value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ManifestConfigForm schema={schema} values={{}} onChange={onChange} />
    );

    await user.type(screen.getByLabelText('Heading'), 'A');

    expect(onChange).toHaveBeenCalledWith('heading', 'A');
  });

  it('parses number fields to a number', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ManifestConfigForm
        schema={schema}
        values={{ max_items: 1 }}
        onChange={onChange}
      />
    );

    await user.type(screen.getByLabelText('Max items'), '2');

    expect(onChange).toHaveBeenCalledWith('max_items', 12);
  });

  it('calls onChange with the toggled value for boolean fields', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ManifestConfigForm schema={schema} values={{}} onChange={onChange} />
    );

    await user.click(screen.getByLabelText('Show counter'));

    expect(onChange).toHaveBeenCalledWith('show_counter', true);
  });

  it('calls onChange with the full multiloc for multiloc fields', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ManifestConfigForm schema={schema} values={{}} onChange={onChange} />
    );

    await user.type(screen.getByLabelText('Intro'), 'H');

    expect(onChange).toHaveBeenCalledWith('intro', { en: 'H' });
  });

  it('renders the localized options of a select field', () => {
    render(
      <ManifestConfigForm
        schema={schema}
        values={{ sort_order: 'popular' }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Sort order')).toHaveValue('popular');
    expect(
      screen.getByRole('option', { name: 'Most recent' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Most popular' })
    ).toBeInTheDocument();
  });
});
