import React, { ReactNode, useEffect, useRef } from 'react';

import TranslationGap from '../TranslatedField/TranslationGap';

import LanguageBar, { LanguageBarProps } from './LanguageBar';
import styles from './TranslatedFieldGroup.module.css';
import '../tokens.css';

export { LanguageBar };

type Props = Omit<LanguageBarProps, 'isBlocked'> & {
  // Set once a save stopped on a missing language: names every missing field
  // and turns the count red. The fields keep their border.
  blockedMessage?: string;
  // The fields, each showing selectedLanguage.
  children: ReactNode;
};

const EDITABLE = 'input:not([type="hidden"]), textarea, [contenteditable="true"]';

// Hidden inputs, such as a rich text editor's link box, are not fields to fill.
const isEmptyField = (element: HTMLElement) =>
  ('checkVisibility' in element ? element.checkVisibility() : true) &&
  (element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement
    ? !element.value.trim()
    : !element.textContent.trim());

// A group of translated fields that switch language together: one language
// bar above them and one line under them naming what is left to translate.
const TranslatedFieldGroup = ({ blockedMessage, children, ...bar }: Props) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const isBlocked = !!blockedMessage;

  // A blocked save lands in the first empty field of the language it switched to.
  useEffect(() => {
    if (!isBlocked) return;
    const fields = groupRef.current?.querySelectorAll<HTMLElement>(EDITABLE);
    [...(fields ?? [])].find(isEmptyField)?.focus();
  }, [isBlocked, bar.selectedLanguage]);

  return (
    <div ref={groupRef} className={styles.group}>
      <LanguageBar {...bar} isBlocked={isBlocked} />
      {children}
      {blockedMessage && <TranslationGap message={blockedMessage} />}
    </div>
  );
};

export default TranslatedFieldGroup;
