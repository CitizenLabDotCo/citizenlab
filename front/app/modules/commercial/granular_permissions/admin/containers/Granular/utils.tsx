import { TPhases } from 'hooks/usePhases';
import {
  IGlobalPermissionAction,
  IPermissionData,
} from 'services/actionPermissions';
import { getInputTerm } from 'services/participationContexts';
import { IProjectData } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';
import { IPCPermissionAction } from 'typings';

type GetPermissionActionMessageProps = {
  permissionAction: IPCPermissionAction | IGlobalPermissionAction;
  postType: 'defaultInput' | 'nativeSurvey' | 'initiative';
  project: IProjectData | null | undefined;
  phases: TPhases;
};

export type HandlePermissionChangeProps = {
  permission: IPermissionData;
  permittedBy?: IPermissionData['attributes']['permitted_by'];
  globalCustomFields?: IPermissionData['attributes']['global_custom_fields'];
  groupIds: string[];
};

export const getPermissionActionMessage = ({
  permissionAction,
  postType,
  project,
  phases,
}: GetPermissionActionMessageProps) => {
  if (postType !== 'initiative' && !isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases
    );
    return {
      posting_idea:
        postType === 'nativeSurvey'
          ? messages.permissionAction_take_survey
          : getInputTermMessage(inputTerm, {
              idea: messages.permissionAction_submit_idea,
              project: messages.permissionAction_submit_project,
              contribution: messages.permissionAction_submit_contribution,
              issue: messages.permissionAction_submit_issue,
              question: messages.permissionAction_submit_question,
              option: messages.permissionAction_submit_option,
            }),
      voting_idea: getInputTermMessage(inputTerm, {
        idea: messages.permissionAction_vote_ideas,
        project: messages.permissionAction_vote_projects,
        contribution: messages.permissionAction_vote_contributions,
        issue: messages.permissionAction_vote_issues,
        question: messages.permissionAction_vote_questions,
        option: messages.permissionAction_vote_options,
      }),
      commenting_idea: getInputTermMessage(inputTerm, {
        idea: messages.permissionAction_comment_ideas,
        project: messages.permissionAction_comment_projects,
        contribution: messages.permissionAction_comment_contributions,
        issue: messages.permissionAction_comment_issues,
        question: messages.permissionAction_comment_questions,
        option: messages.permissionAction_comment_options,
      }),
      taking_survey: messages.permissionAction_take_survey,
      taking_poll: messages.permissionAction_take_poll,
      budgeting: messages.permissionAction_budgeting,
    }[permissionAction];
  }

  if (postType === 'initiative') {
    return {
      voting_initiative: messages.permissionAction_vote_proposals,
      commenting_initiative: messages.permissionAction_comment_proposals,
      posting_initiative: messages.permissionAction_post_proposal,
    }[permissionAction];
  }
};

export const getPermissionActionSectionSubtitle = ({
  permissionAction,
  postType,
  project,
  phases,
}: GetPermissionActionMessageProps) => {
  if (postType !== 'initiative' && !isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases
    );

    return {
      posting_idea:
        postType === 'nativeSurvey'
          ? messages.permissionAction_take_survey_subtitle
          : getInputTermMessage(inputTerm, {
              idea: messages.permissionAction_submit_idea_subtitle,
              project: messages.permissionAction_submit_project_subtitle,
              contribution:
                messages.permissionAction_submit_contribution_subtitle,
              issue: messages.permissionAction_submit_issue_subtitle,
              question: messages.permissionAction_submit_question_subtitle,
              option: messages.permissionAction_submit_option_subtitle,
            }),
      voting_idea: getInputTermMessage(inputTerm, {
        idea: messages.permissionAction_vote_ideas_subtitle,
        project: messages.permissionAction_vote_projects_subtitle,
        contribution: messages.permissionAction_vote_contributions_subtitle,
        issue: messages.permissionAction_vote_issues_subtitle,
        question: messages.permissionAction_vote_questions_subtitle,
        option: messages.permissionAction_vote_options_subtitle,
      }),
      commenting_idea: getInputTermMessage(inputTerm, {
        idea: messages.permissionAction_comment_ideas_subtitle,
        project: messages.permissionAction_comment_projects_subtitle,
        contribution: messages.permissionAction_comment_contributions_subtitle,
        issue: messages.permissionAction_comment_issues_subtitle,
        question: messages.permissionAction_comment_questions_subtitle,
        option: messages.permissionAction_comment_options_subtitle,
      }),
      taking_survey: messages.permissionAction_take_survey_subtitle,
      taking_poll: messages.permissionAction_take_poll_subtitle,
      budgeting: messages.permissionAction_budgeting_subtitle,
    }[permissionAction];
  }
  if (postType === 'initiative') {
    return {
      voting_initiative: messages.permissionAction_vote_proposals_subtitle,
      commenting_initiative:
        messages.permissionAction_comment_proposals_subtitle,
      posting_initiative: messages.permissionAction_post_proposal_subtitle,
    }[permissionAction];
  }
};
