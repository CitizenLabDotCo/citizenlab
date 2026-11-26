import React from 'react';

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

import styles from './LanguageSwitcher.module.css';
import messages from './messages';
import '../tokens.css';

export type LanguageOption = {
  id: string;
  // The language's own name, e.g. "Français".
  name: string;
  // Every field the switcher drives has text in this language.
  done: boolean;
};

type Props = {
  // Names what the switcher drives, e.g. "Title and description".
  'aria-label': string;
  languages: LanguageOption[];
  selectedId: string;
  onChange: (id: string) => void;
};

// Picks the language a group of multilingual fields shows. "1/3" counts the
// languages done while some still need text. Hidden on a one-language platform.
const LanguageSwitcher = ({
  'aria-label': ariaLabel,
  languages,
  selectedId,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();

  if (languages.length < 2) return null;

  const selected =
    languages.find((language) => language.id === selectedId) ?? languages[0];
  const doneCount = languages.filter((language) => language.done).length;
  const allDone = doneCount === languages.length;
  const progress = formatMessage(messages.languagesDone, {
    done: doneCount,
    total: languages.length,
  });

  return (
    <MenuTrigger>
      <AriaButton
        className={styles.trigger}
        aria-label={`${ariaLabel}: ${selected.name}. ${progress}`}
        data-language-switcher
      >
        <span>{selected.name}</span>
        {!allDone && (
          <span className={styles.count} aria-hidden>
            {`${doneCount}/${languages.length}`}
          </span>
        )}
        <Icon name="chevron-down-12" className={styles.chevron} />
      </AriaButton>
      <Popover
        placement="bottom end"
        offset={4}
        className={`${surfaces.dropdown} ${styles.popover}`}
      >
        <AriaMenu
          aria-label={ariaLabel}
          className={styles.menu}
          onAction={(key: Key) => onChange(String(key))}
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

export default LanguageSwitcher;
