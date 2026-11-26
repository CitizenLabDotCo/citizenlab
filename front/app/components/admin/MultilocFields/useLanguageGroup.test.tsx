import React from 'react';

import { Multiloc } from 'typings';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import LanguageButtonContext from './LanguageButtonContext';
import LanguageChecksContext, {
  useLanguageChecks,
} from './LanguageChecksContext';
import useLanguageGroup from './useLanguageGroup';

jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-BE', 'fr-BE'])
);

interface Props {
  title: Multiloc;
  description: Multiloc;
  onSave: (saved: boolean) => void;
}

const Group = ({ title, description }: Omit<Props, 'onSave'>) => {
  const group = useLanguageGroup([
    { value: title, name: 'title', required: true },
    { value: description, name: 'description' },
  ]);

  return (
    <>
      <p>{`Showing ${group.selectedLocale}`}</p>
      <p>{`Done ${
        Object.values(group.translations).filter(Boolean).length
      }`}</p>
      {group.error && <p role="alert">{group.error}</p>}
    </>
  );
};

const Form = ({ onSave, ...values }: Props) => {
  const { checks, checkLanguages } = useLanguageChecks();

  return (
    <LanguageChecksContext.Provider value={checks}>
      <Group {...values} />
      <button onClick={() => onSave(checkLanguages())}>Save</button>
    </LanguageChecksContext.Provider>
  );
};

const renderForm = (props: Props, redesigned = true) =>
  render(
    <LanguageButtonContext.Provider value={redesigned}>
      <Form {...props} />
    </LanguageButtonContext.Provider>
  );

describe('useLanguageGroup', () => {
  it('counts a language done once no field is left to translate', () => {
    renderForm({
      title: { en: 'Park', 'nl-BE': 'Park', 'fr-BE': 'Parc' },
      description: { en: '<p>Trees</p>', 'nl-BE': '<p><br></p>' },
      onSave: jest.fn(),
    });

    // Dutch has an empty editor and French no description at all.
    expect(screen.getByText('Done 1')).toBeInTheDocument();
  });

  it('blocks saving, opens the first missing language and names what is missing', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderForm({
      title: { en: 'Park', 'fr-BE': 'Parc' },
      description: { en: '<p>Trees</p>' },
      onSave,
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(false);
    expect(screen.getByText('Showing nl-BE')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add the title and description in Nederlands (België) and 1 more language'
    );
  });

  it('leaves an empty required field to the form', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderForm({ title: {}, description: {}, onSave });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not block outside the new back office', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderForm({ title: { en: 'Park' }, description: {}, onSave }, false);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(true);
  });
});
