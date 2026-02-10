import React, { useMemo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import { FormatMessage, IOption } from 'typings';

import { InputTerm } from 'api/phases/types';
import { INPUT_TERMS } from 'api/phases/utils';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../messages';

const LABEL_MESSAGES: {
  [key in InputTerm]: MessageDescriptor;
} = {
  idea: messages.ideaTerm,
  contribution: messages.contributionTerm,
  question: messages.questionTerm,
  option: messages.optionTerm,
  issue: messages.issueTerm,
  project: messages.projectTerm,
  proposal: messages.proposalTerm,
  initiative: messages.initiativeTerm,
  petition: messages.petitionTerm,
  comment: messages.commentTerm,
  statement: messages.statementTerm,
};

export const getInputTermOptions = (formatMessage: FormatMessage) => {
  return INPUT_TERMS.map((inputTerm: InputTerm) => {
    const labelMessage = LABEL_MESSAGES[inputTerm];

    return {
      value: inputTerm,
      label: formatMessage(labelMessage),
    } as IOption;
  });
};

interface Props {
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
}

export default ({ input_term, handleInputTermChange }: Props) => {
  const { formatMessage } = useIntl();
  const inputTermOptions = useMemo(
    () => getInputTermOptions(formatMessage),
    [formatMessage]
  );

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.inputTermSelectLabel} />
      </SubSectionTitle>
      <Select
        value={input_term}
        options={inputTermOptions}
        onChange={handleInputTermChange}
      />
    </SectionField>
  );
};
