import React, { RefObject } from 'react';

import {
  Button as AriaButton,
  Key,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger,
  Popover,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';
import surfaces from '../surfaces.module.css';

import messages from './messages';
import styles from './TranslatedField.module.css';
import { TranslationLanguage } from './types';
import '../tokens.css';

type Props = {
  // Names what the picker drives, e.g. "Project title".
  'aria-label': string;
  languages: TranslationLanguage[];
  selectedLanguage: string;
  onLanguageChange: (id: string) => void;
  // Inline: the left segment of a field. Bar: on its own, above a group of fields.
  variant: 'inline' | 'bar';
  isDisabled?: boolean;
  // Inline, the menu hangs under the whole field rather than under the picker.
  fieldRef?: RefObject<HTMLDivElement>;
};

// Opens the language menu: a check for each language done, a dashed circle
// for each one still to translate.
const LanguagePicker = ({
  'aria-label': ariaLabel,
  languages,
  selectedLanguage,
  onLanguageChange,
  variant,
  isDisabled,
  fieldRef,
}: Props) => {
  const { formatMessage } = useIntl();

  const selected =
    languages.find((language) => language.id === selectedLanguage) ??
    languages[0];

  return (
    <MenuTrigger>
      <AriaButton
        className={variant === 'inline' ? styles.inlinePicker : styles.barPicker}
        aria-label={`${ariaLabel}: ${selected.name}`}
        isDisabled={isDisabled}
      >
        <span>{selected.name}</span>
        <Icon name="chevron-down-12" className={styles.chevron} />
      </AriaButton>
      <Popover
        triggerRef={variant === 'inline' ? fieldRef : undefined}
        placement={variant === 'inline' ? 'bottom start' : 'bottom end'}
        offset={8}
        className={`${surfaces.dropdown} ${styles.popover}`}
      >
        <AriaMenu
          aria-label={ariaLabel}
          className={styles.menu}
          onAction={(key: Key) => onLanguageChange(String(key))}
        >
          {languages.map((language) => (
            <AriaMenuItem
              key={language.id}
              id={language.id}
              textValue={language.name}
              aria-label={
                language.done
                  ? language.name
                  : formatMessage(messages.toTranslate, {
                      language: language.name,
                    })
              }
              data-current={language.id === selected.id || undefined}
              className={styles.item}
            >
              <Icon
                name={
                  language.done
                    ? 'circle-check-filled-16'
                    : 'circle-dashed-1-16'
                }
                className={language.done ? styles.done : styles.toDo}
              />
              <span className={styles.name}>{language.name}</span>
            </AriaMenuItem>
          ))}
        </AriaMenu>
      </Popover>
    </MenuTrigger>
  );
};

export default LanguagePicker;
