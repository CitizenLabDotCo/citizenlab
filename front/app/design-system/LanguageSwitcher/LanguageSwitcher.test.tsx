import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import LanguageSwitcher, { LanguageOption } from '.';

const languages: LanguageOption[] = [
  { id: 'en', name: 'English', done: true },
  { id: 'nl-BE', name: 'Nederlands (België)', done: false },
  { id: 'fr-BE', name: 'Français (Belgique)', done: false },
];

describe('LanguageSwitcher', () => {
  it('names the language and counts the ones done', () => {
    render(
      <LanguageSwitcher
        aria-label="Title and description"
        languages={languages}
        selectedId="en"
        onChange={jest.fn()}
      />
    );

    const trigger = screen.getByRole('button', {
      name: 'Title and description: English. 1 of 3 languages done',
    });
    expect(trigger).toHaveTextContent('English');
    expect(trigger).toHaveTextContent('1/3');
  });

  it('drops the count once all languages are done', () => {
    render(
      <LanguageSwitcher
        aria-label="Title"
        languages={languages.map((language) => ({ ...language, done: true }))}
        selectedId="nl-BE"
        onChange={jest.fn()}
      />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Nederlands (België)');
    expect(trigger).not.toHaveTextContent('3/3');
  });

  it('marks the languages still to translate and picks one', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <LanguageSwitcher
        aria-label="Title"
        languages={languages}
        selectedId="en"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('menuitem', { name: 'English' })).toHaveAttribute(
      'data-current'
    );
    await user.click(
      screen.getByRole('menuitem', {
        name: 'Français (Belgique), to translate',
      })
    );

    expect(onChange).toHaveBeenCalledWith('fr-BE');
  });

  it('is not shown on a one-language platform', () => {
    render(
      <LanguageSwitcher
        aria-label="Title"
        languages={[languages[0]]}
        selectedId="en"
        onChange={jest.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
