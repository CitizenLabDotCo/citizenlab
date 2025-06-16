import React from 'react';

import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';

import { InputTerm } from 'api/phases/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';
import tracks from './tracks';

interface Props {
  linkTo: RouteType;
  inputTerm: InputTerm;
}

const NewIdeaButton = ({ linkTo, inputTerm }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  return (
    <ButtonWithLink
      id="e2e-new-idea"
      buttonStyle="admin-dark"
      icon="plus"
      linkTo={linkTo}
      onClick={() => {
        trackEventByName(tracks.clickNewIdea.name, {
          pathnameFrom: pathname,
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
          proposal: messages.newProposal,
          initiative: messages.newInitiative,
          petition: messages.newPetition,
        })
      )}
    />
  );
};

export default NewIdeaButton;
