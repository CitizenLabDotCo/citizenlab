import React from 'react';

// services
import { InputTerm } from 'utils/participationContexts';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './../messages';
import { WrappedComponentProps } from 'react-intl';

// components
import Button from 'components/UI/Button';
import { getInputTermMessage } from 'utils/i18n';

interface Props {
  linkTo: string;
  inputTerm: InputTerm;
}

const NewIdeaButton = ({
  linkTo,
  inputTerm,
}: Props & WrappedComponentProps) => {
  const { formatMessage } = useIntl();
  return (
    <Button
      id="e2e-new-idea"
      buttonStyle="cl-blue"
      icon="idea"
      linkTo={linkTo}
      text={formatMessage(
        getInputTermMessage(inputTerm, {
          idea: messages.addNewIdea,
          option: messages.addNewOption,
          project: messages.addNewProject,
          question: messages.addNewQuestion,
          issue: messages.addNewIssue,
          contribution: messages.addNewContribution,
        })
      )}
    />
  );
};

export default NewIdeaButton;
