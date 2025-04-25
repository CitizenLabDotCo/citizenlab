import React from 'react';

import { NonLockedIdeationInputStatusCode } from 'api/idea_statuses/types';

import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import LabelText from './LabelText';
import messages from './messages';

const nonLockedIdeationInputStatusCodes: NonLockedIdeationInputStatusCode[] = [
  'viewed',
  'under_consideration',
  'accepted',
  'rejected',
  'implemented',
  'custom',
];

const ideationCodeTitleMessages: {
  [key in NonLockedIdeationInputStatusCode]: MessageDescriptor;
} = {
  viewed: messages.viewedFieldCodeTitle,
  under_consideration: messages.under_considerationFieldCodeTitle,
  accepted: messages.acceptedFieldCodeTitle,
  rejected: messages.rejectedFieldCodeTitle,
  implemented: messages.implementedFieldCodeTitle,
  custom: messages.customFieldCodeTitle,
};
const ideationCodeDescriptionMessages: {
  [key in NonLockedIdeationInputStatusCode]: MessageDescriptor;
} = {
  viewed: messages.viewedFieldCodeDescription,
  under_consideration: messages.under_considerationFieldCodeDescription,
  accepted: messages.acceptedFieldCodeDescription,
  rejected: messages.rejectedFieldCodeDescription,
  implemented: messages.implementedFieldCodeDescription,
  custom: messages.customFieldCodeDescription1,
};

const codeTitleMessage = (code: NonLockedIdeationInputStatusCode) =>
  ideationCodeTitleMessages[code];
const codeDescriptionMessage = (code: NonLockedIdeationInputStatusCode) =>
  ideationCodeDescriptionMessages[code];

const IdeationStatusCategories = () => {
  const { formatMessage } = useIntl();

  return (
    <RadioGroup name="code">
      {nonLockedIdeationInputStatusCodes.map((code, i) => (
        <Radio
          key={`code-input-${i}`}
          label={
            <LabelText>
              <span className="header">
                {formatMessage(codeTitleMessage(code))}
              </span>
              <span className="description">
                {formatMessage(codeDescriptionMessage(code))}
              </span>
            </LabelText>
          }
          id={`${code}-input`}
          name="code"
          value={code}
        />
      ))}
    </RadioGroup>
  );
};

export default IdeationStatusCategories;
