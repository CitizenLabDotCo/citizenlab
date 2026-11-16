import React, { lazy, Suspense, useState } from 'react';

import { useController } from 'react-hook-form';

import useLocale from 'hooks/useLocale';

import Emoji from 'components/UI/Emoji';
import { getEmojiMartLocale } from 'components/UI/EmojiPicker/localeMapping';
import emojiPickerMessages from 'components/UI/EmojiPicker/messages';

import Button from 'design-system/Button';
import Popover, { DialogTrigger } from 'design-system/Popover';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import styles from './InputTopicModal.module.css';

const Picker = lazy(() => import('components/UI/EmojiPicker/Picker'));

interface Props {
  label: string;
}

// The topic's emoji: the emoji-mart picker in a design-system popover.
const TopicEmojiField = ({ label }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const { field } = useController({ name: 'icon', defaultValue: null });
  const value: unknown = field.value;
  const emoji = typeof value === 'string' && value ? value : undefined;

  return (
    <div className={styles.emojiField}>
      <span className={styles.emojiLabel}>{label}</span>
      <div className={styles.emojiControl}>
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
          {emoji ? (
            <Button id="icon" aria-label={label}>
              <Emoji emoji={emoji} size="20px" />
            </Button>
          ) : (
            <Button id="icon" icon="plus-16" aria-label={label} />
          )}
          <Popover aria-label={label} width="hug">
            <Suspense fallback={null}>
              <Picker
                locale={getEmojiMartLocale(locale)}
                onEmojiSelect={(selected: { native: string }) => {
                  field.onChange(selected.native);
                  setIsOpen(false);
                }}
              />
            </Suspense>
          </Popover>
        </DialogTrigger>
        {emoji && (
          <Button variant="quiet" onPress={() => field.onChange(null)}>
            {formatMessage(emojiPickerMessages.clear)}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopicEmojiField;
