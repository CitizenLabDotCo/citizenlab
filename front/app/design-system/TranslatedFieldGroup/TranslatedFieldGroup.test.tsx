import React from 'react';

import { TranslationLanguage } from 'design-system/TranslatedField';

import { render, screen } from 'utils/testUtils/rtl';

import TranslatedFieldGroup from '.';

const languages: TranslationLanguage[] = [
  { id: 'en', name: 'English', done: true },
  { id: 'nl-BE', name: 'Nederlands (België)', done: false },
];

const props = {
  'aria-label': 'Survey title and button',
  languages,
  selectedLanguage: 'nl-BE',
  onLanguageChange: jest.fn(),
  hasText: true,
};

describe('TranslatedFieldGroup', () => {
  it('shows one count and one picker for all its fields', () => {
    render(
      <TranslatedFieldGroup {...props}>
        <input aria-label="Survey title" defaultValue="Survey" />
        <input aria-label="Button" defaultValue="Take the survey" />
      </TranslatedFieldGroup>
    );

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(
      screen.getByRole('button', {
        name: 'Survey title and button: Nederlands (België)',
      })
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 languages');
  });

  it('names every missing field after a blocked save and focuses the first empty one', () => {
    render(
      <TranslatedFieldGroup
        {...props}
        blockedMessage="Add the survey title and button in Nederlands (België)"
      >
        <input aria-label="Survey title" defaultValue="Enquête" />
        <input aria-label="Button" defaultValue="" />
      </TranslatedFieldGroup>
    );

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-status',
      'blocked'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add the survey title and button in Nederlands (België)'
    );
    expect(screen.getByRole('textbox', { name: 'Button' })).toHaveFocus();
  });

  it('shows no bar on a one-language platform', () => {
    render(
      <TranslatedFieldGroup {...props} languages={[languages[0]]}>
        <input aria-label="Survey title" />
      </TranslatedFieldGroup>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
