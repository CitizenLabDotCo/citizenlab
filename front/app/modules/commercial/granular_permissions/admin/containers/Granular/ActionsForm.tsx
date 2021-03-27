import React, { memo } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IPermissionData,
  IGlobalPermissionAction,
  IPCPermissionAction,
} from 'services/actionPermissions';
import { getInputTerm } from 'services/participationContexts';

// components
import ActionForm from './ActionForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

const ActionPermissionWrapper = styled.div`
  margin-bottom: 30px;

  &.last {
    margin-bottom: 0;
  }
`;

type PostTypeProps =
  | {
      postType: 'idea';
      projectId: string;
    }
  | {
      postType: 'initiative';
      projectId: null;
    };

type SharedProps = {
  permissions: IPermissionData[];
  onChange: (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => void;
};

type Props = PostTypeProps & SharedProps;

const ActionsForm = memo(
  ({ permissions, postType, onChange, projectId }: Props) => {
    const project = useProject({ projectId });
    const phases = usePhases(projectId);
    const handlePermissionChange = (permission: IPermissionData) => (
      permittedBy: IPermissionData['attributes']['permitted_by'],
      groupIds: string[]
    ) => {
      onChange(permission, permittedBy, groupIds);
    };

    const getPermissionActionMessage = (
      permissionAction: IPCPermissionAction | IGlobalPermissionAction
    ) => {
      if (postType === 'idea' && !isNilOrError(project)) {
        const inputTerm = getInputTerm(
          project.attributes.process_type,
          project,
          phases
        );

        return {
          posting_idea: getInputTermMessage(inputTerm, {
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

    if (isEmpty(permissions)) {
      return (
        <p>
          <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
        </p>
      );
    } else {
      return (
        <>
          {permissions.map((permission, index) => {
            const permissionAction = permission.attributes.action;

            return (
              <ActionPermissionWrapper
                key={permission.id}
                className={`${index === 0 ? 'first' : ''} ${
                  index === permissions.length - 1 ? 'last' : ''
                }`}
              >
                <h4>
                  <FormattedMessage
                    {...getPermissionActionMessage(permissionAction)}
                  />
                </h4>
                <ActionForm
                  permissionData={permission}
                  groupIds={permission.relationships.groups.data.map(
                    (p) => p.id
                  )}
                  onChange={handlePermissionChange(permission)}
                />
              </ActionPermissionWrapper>
            );
          })}
        </>
      );
    }
  }
);

export default ActionsForm;
