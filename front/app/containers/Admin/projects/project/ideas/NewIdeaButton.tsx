import React from 'react';

import { useLocation } from 'react-router-dom';

import { InputTerm } from 'api/phases/types';

import Button from 'components/UI/Button';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import tracks from '../tracks';

import messages from './../messages';

interface Props {
  linkTo: string;
  inputTerm: InputTerm;
}

const NewIdeaButton = ({ linkTo, inputTerm }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  return (
    <Button
      id="e2e-new-idea"
      buttonStyle="cl-blue"
      icon="plus"
      linkTo={linkTo}
      onClick={() => {
        trackEventByName(tracks.clickNewIdea.name, {
          extra: { pathnameFrom: pathname },
        });
      }}
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
