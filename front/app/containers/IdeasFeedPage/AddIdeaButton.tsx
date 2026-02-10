import React from 'react';

import Button from 'component-library/components/Button';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import { getInputTerm } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

interface Props {
  projectSlug: string;
  phaseId: string;
}

const AddIdeaButton = ({ projectSlug, phaseId }: Props) => {
  const { data: project } = useProjectBySlug(projectSlug);
  const { data: phase } = usePhase(phaseId);
  const { data: authUser } = useAuthUser();

  if (!project || !phase) return null;

  const { enabled, authenticationRequirements } = getIdeaPostingRules({
    project: project.data,
    phase: phase.data,
    authUser: authUser?.data,
  });

  const redirectToIdeaForm = () => {
    clHistory.push(
      {
        pathname: `/projects/${projectSlug}/ideas/new`,
        search: `?phase_id=${phaseId}`,
      },
      { scrollToTop: true }
    );
  };

  const handleClick = () => {
    if (authenticationRequirements) {
      const successAction: SuccessAction = {
        name: 'redirectToIdeaForm',
        params: {
          projectSlug,
          phaseId,
        },
      };

      triggerAuthenticationFlow(
        {
          context: {
            action: 'posting_idea',
            id: phaseId,
            type: 'phase',
          },
          successAction,
        },
        'signin'
      );
      return;
    }

    if (enabled === true) {
      redirectToIdeaForm();
    }
  };

  return (
    <Button icon="plus-circle" onClick={handleClick}>
      <FormattedMessage
        {...getInputTermMessage(getInputTerm([phase.data]), {
          idea: messages.addAnIdea,
          option: messages.addAnOption,
          project: messages.addAProject,
          question: messages.addAQuestion,
          issue: messages.addAnIssue,
          contribution: messages.addAContribution,
          proposal: messages.addAProposal,
          initiative: messages.addAnInitiative,
          petition: messages.addAPetition,
          comment: messages.addAComment,
          statement: messages.addAStatement,
        })}
      />
    </Button>
  );
};

export default AddIdeaButton;
