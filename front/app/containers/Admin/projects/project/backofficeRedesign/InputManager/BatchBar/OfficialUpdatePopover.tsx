import React, { useState } from 'react';

import Button from 'design-system/Button';
import Popover, { DialogTrigger } from 'design-system/Popover';
import Text from 'design-system/Text';
import TextArea from 'design-system/TextArea';
import TextField from 'design-system/TextField';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './OfficialUpdatePopover.module.css';
import 'design-system/tokens.css';

interface Props {
  inputTerm: string;
  count: number;
  onSend: (body: string, author: string) => void;
}

const OfficialUpdatePopover = ({ inputTerm, count, onSend }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const label = formatMessage(messages.officialUpdate);

  const send = () => {
    onSend(
      body.trim(),
      author.trim() || formatMessage(messages.officialUpdateDefaultAuthor)
    );
    setIsOpen(false);
    setBody('');
    setAuthor('');
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button size={28} icon="message-square-16">
        {label}
      </Button>
      <Popover aria-label={label} placement="bottom start">
        <div className={styles.form}>
          <TextArea
            label={label}
            value={body}
            onChange={setBody}
            placeholder={formatMessage(messages.officialUpdatePlaceholder)}
          />
          <TextField
            label={formatMessage(messages.officialUpdateAuthor)}
            value={author}
            onChange={setAuthor}
            placeholder={formatMessage(
              messages.officialUpdateAuthorPlaceholder
            )}
            size={32}
          />
          <div className={styles.footer}>
            <Text variant="small" tone="secondary">
              {formatMessage(messages.officialUpdateRecipients, {
                inputTerm,
                count,
              })}
            </Text>
            <Button
              variant="primary"
              size={32}
              isDisabled={body.trim() === ''}
              onPress={send}
            >
              {formatMessage(messages.sendOfficialUpdate)}
            </Button>
          </div>
        </div>
      </Popover>
    </DialogTrigger>
  );
};

export default OfficialUpdatePopover;
