import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import Error from 'components/UI/Error';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isValidEmail } from 'utils/validate';

import messages from '../messages';

const INVALID_SAMPLE_SIZE = 5;

type Props = {
  value?: string[];
  onChange: (value: string[]) => void;
};

const parseEmails = (text: string) => [
  ...new Set(
    text
      .split(/[\s,;]+/)
      .map((email) => email.toLowerCase())
      .filter((email) => email.length > 0)
  ),
];

const EmailListValueSelector = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const [text, setText] = useState(() => (value ?? []).join('\n'));

  const emails = parseEmails(text);
  const invalidEmails = emails.filter((email) => !isValidEmail(email));

  const handleOnChange = (newText: string) => {
    setText(newText);
    onChange(parseEmails(newText));
  };

  return (
    <Box>
      <TextArea
        value={text}
        rows={6}
        maxRows={16}
        placeholder={formatMessage(messages.emailListPlaceholder)}
        onChange={handleOnChange}
      />
      <Text color="textSecondary" fontSize="s" mt="4px" mb="0">
        <FormattedMessage
          {...messages.emailListCount}
          values={{ count: emails.length }}
        />
      </Text>
      {invalidEmails.length > 0 && (
        <Error
          marginTop="8px"
          text={formatMessage(messages.emailListInvalid, {
            count: invalidEmails.length,
            emails: invalidEmails.slice(0, INVALID_SAMPLE_SIZE).join(', '),
          })}
        />
      )}
    </Box>
  );
};

export default EmailListValueSelector;
