import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import TranslatedField, { TranslationLanguage } from '.';

const languages: TranslationLanguage[] = [
  { id: 'en', name: 'English', done: true },
  { id: 'nl-BE', name: 'Nederlands (België)', done: false },
  { id: 'fr-BE', name: 'Français (Belgique)', done: false },
];

const props = {
  label: 'Project title',
  value: 'Station Square',
  onChange: jest.fn(),
  languages,
  selectedLanguage: 'en',
  onLanguageChange: jest.fn(),
  hasText: true,
};

describe('TranslatedField', () => {
  it('picks the language inside the field and counts the ones done', () => {
    render(<TranslatedField {...props} />);

    expect(
      screen.getByRole('button', { name: 'Project title: English' })
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Project title' })).toHaveValue(
      'Station Square'
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 languages');
    expect(screen.getByRole('status')).toHaveAttribute(
      'data-status',
      'toTranslate'
    );
  });

  it('stays grey before any text and turns complete once all are done', () => {
    const { rerender } = render(
      <TranslatedField {...props} value="" hasText={false} />
    );
    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 languages');
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'empty');

    rerender(
      <TranslatedField
        {...props}
        languages={languages.map((language) => ({ ...language, done: true }))}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('3 of 3 languages');
    expect(screen.getByRole('status')).toHaveAttribute(
      'data-status',
      'complete'
    );
  });

  it('names what is missing after a blocked save and puts the cursor in the field', () => {
    render(
      <TranslatedField
        {...props}
        value=""
        selectedLanguage="nl-BE"
        blockedMessage="Add the project title in Nederlands (België) and 1 more language"
      />
    );

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-status',
      'blocked'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add the project title in Nederlands (België) and 1 more language'
    );
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('marks the languages still to translate and picks one', async () => {
    const user = userEvent.setup();
    const onLanguageChange = jest.fn();
    render(<TranslatedField {...props} onLanguageChange={onLanguageChange} />);

    await user.click(screen.getByRole('button', { name: 'Project title: English' }));
    expect(screen.getByRole('menuitem', { name: 'English' })).toHaveAttribute(
      'data-current'
    );
    await user.click(
      screen.getByRole('menuitem', {
        name: 'Français (Belgique), to translate',
      })
    );

    expect(onLanguageChange).toHaveBeenCalledWith('fr-BE');
  });

  it('is a plain text field on a one-language platform', () => {
    render(<TranslatedField {...props} languages={[languages[0]]} />);

    expect(screen.getByRole('textbox', { name: 'Project title' })).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
