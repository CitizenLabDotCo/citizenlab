import React from 'react';

import { NonLockedProposalInputStatusCode } from 'api/idea_statuses/types';

import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import LabelText from './LabelText';
import messages from './messages';

const nonLockedProposalInputStatusCodes: NonLockedProposalInputStatusCode[] = [
  'answered',
  'ineligible',
  'custom',
];

const proposalCodeTitleMessages: {
  [key in NonLockedProposalInputStatusCode]: MessageDescriptor;
} = {
  custom: messages.customFieldCodeTitle,
  answered: messages.answeredFieldCodeTitle,
  ineligible: messages.ineligibleFieldCodeTitle,
};
const proposalCodeDescriptionMessages: {
  [key in NonLockedProposalInputStatusCode]: MessageDescriptor;
} = {
  custom: messages.customFieldCodeDescription1,
  answered: messages.answeredFieldCodeDescription,
  ineligible: messages.ineligibleFieldCodeDescription,
};

const codeTitleMessage = (code: NonLockedProposalInputStatusCode) =>
  proposalCodeTitleMessages[code];
const codeDescriptionMessage = (code: NonLockedProposalInputStatusCode) =>
  proposalCodeDescriptionMessages[code];

const ProposalStatusCategories = () => {
  const { formatMessage } = useIntl();

  return (
    <RadioGroup name="code">
      {nonLockedProposalInputStatusCodes.map((code, i) => (
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

export default ProposalStatusCategories;
