import React from 'react';

// services
import { InputTerm } from 'utils/participationContexts';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './../messages';

// components
import Button from 'components/UI/Button';
import { getInputTermMessage } from 'utils/i18n';

interface Props {
  linkTo: string;
  inputTerm: InputTerm;
}

const NewIdeaButton = ({ linkTo, inputTerm }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Button
      id="e2e-new-idea"
      buttonStyle="cl-blue"
      icon="plus"
      linkTo={linkTo}
      text={formatMessage(
        getInputTermMessage(inputTerm, {
          idea: messages.newIdea,
          option: messages.newOption,
          project: messages.newProject,
          question: messages.newQuestion,
          issue: messages.newIssue,
          contribution: messages.newContribution,
        })
      )}
    />
  );
};

export default NewIdeaButton;
