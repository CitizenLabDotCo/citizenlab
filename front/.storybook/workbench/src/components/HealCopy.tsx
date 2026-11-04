import { useEffect, useState } from 'react';

import { copyText } from '../lib/clipboard';

import Icon from './Icon';

export type Copied = { text: string; ok: boolean };

// Copy a heal task and keep what was copied, to show it as text too (the
// heal loop asks for both). The text goes stale when the task changes.
export const useCopy = (current?: string) => {
  const [copied, setCopied] = useState<Copied | undefined>();
  useEffect(() => setCopied(undefined), [current]);
  const copy = async (text: string) =>
    setCopied({ text, ok: await copyText(text) });
  return { copied, copy, clear: () => setCopied(undefined) };
};

type ButtonProps = {
  onClick: () => void;
  label?: string;
  // An icon-only button in dense lists; `label` is then its name.
  iconOnly?: boolean;
  testId?: string;
};

export const HealButton = ({
  onClick,
  label = 'Heal',
  iconOnly,
  testId = 'wb-heal',
}: ButtonProps) => (
  <button
    type="button"
    className={iconOnly ? 'wb-heal-button wb-heal-icon' : 'wb-heal-button'}
    onClick={onClick}
    title={iconOnly ? label : 'Copy the heal task for Claude Code'}
    aria-label={iconOnly ? label : undefined}
    data-testid={testId}
  >
    <Icon name={iconOnly ? 'copy' : 'heal'} size={14} />
    {!iconOnly && label}
  </button>
);

// What was copied, as text: selectable when the browser refused the copy.
export const CopiedText = ({
  copied,
  onClose,
}: {
  copied?: Copied;
  onClose: () => void;
}) =>
  copied ? (
    <div
      className={copied.ok ? 'wb-heal-text' : 'wb-heal-text wb-heal-text-fail'}
      role="status"
      data-testid="wb-heal-text"
    >
      <div className="wb-heal-text-head">
        <span>
          <Icon name={copied.ok ? 'check' : 'copy'} size={14} />
          {copied.ok
            ? 'Copied. Paste it into Claude Code on the branch.'
            : 'Copying was blocked. Select the text and copy it.'}
        </span>
        <button
          type="button"
          className="wb-heal-close"
          onClick={onClose}
          aria-label="Hide the heal task"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      <pre tabIndex={0}>{copied.text}</pre>
    </div>
  ) : null;
