import React from 'react';

import useAuthUser from 'api/me/useAuthUser';
import { InputTerm, IPhase } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { FormattedMessage } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

interface Props {
  phase: IPhase | undefined;
  inputTerm: InputTerm;
  project: IProject;
}

const CTAMessage = ({ phase, inputTerm, project }: Props) => {
  let ctaMessage: JSX.Element | null = null;
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const postingPermission = getIdeaPostingRules({
    project: project?.data,
    phase: phase?.data,
    authUser: authUser?.data,
  });
  const participationMethod = phase?.data.attributes.participation_method;
  const votingMethod = phase?.data.attributes.voting_method;

  const canPost = !!postingPermission.enabled;
  const canReact =
    project.data.attributes.action_descriptors.reacting_idea.enabled;
  const canComment =
    project.data.attributes.action_descriptors.commenting_idea.enabled;

  switch (participationMethod) {
    case 'voting':
      if (votingMethod === 'budgeting') {
        ctaMessage = <FormattedMessage {...messages.allocateYourBudget} />;
      } else {
        ctaMessage = <FormattedMessage {...messages.vote} />;
      }
      break;
    case 'information':
      ctaMessage = <FormattedMessage {...messages.learnMore} />;
      break;
    case 'survey':
      ctaMessage = <FormattedMessage {...messages.takeTheSurvey} />;
      break;
    case 'native_survey':
      ctaMessage = (
        <>{localize(phase?.data.attributes.native_survey_button_multiloc)}</>
      );
      break;
    case 'document_annotation':
      ctaMessage = <FormattedMessage {...messages.reviewDocument} />;
      break;
    case 'poll':
      ctaMessage = <FormattedMessage {...messages.takeThePoll} />;
      break;
    case 'ideation':
      if (canPost) {
        ctaMessage = (
          <FormattedMessage
            {...getInputTermMessage(inputTerm, {
              idea: messages.submitYourIdea,
              option: messages.addYourOption,
              project: messages.submitYourProject,
              question: messages.joinDiscussion,
              issue: messages.submitAnIssue,
              contribution: messages.contributeYourInput,
            })}
          />
        );
      } else if (canReact) {
        ctaMessage = <FormattedMessage {...messages.reaction} />;
      } else if (canComment) {
        ctaMessage = <FormattedMessage {...messages.comment} />;
      } else {
        ctaMessage = (
          <FormattedMessage
            {...getInputTermMessage(inputTerm, {
              idea: messages.viewTheIdeas,
              option: messages.viewTheOptions,
              project: messages.viewTheProjects,
              question: messages.viewTheQuestions,
              issue: messages.viewTheIssues,
              contribution: messages.viewTheContributions,
            })}
          />
        );
      }
      break;
    default:
      ctaMessage = null;
  }

  return ctaMessage;
};

export default CTAMessage;
