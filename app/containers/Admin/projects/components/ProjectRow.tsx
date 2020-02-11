import React from 'react';
import { IProjectData } from 'services/projects';
import GetProjectGroups from 'resources/GetProjectGroups';
import { isNilOrError } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import T from 'components/T';
import { fontSizes } from 'utils/styleUtils';
import StatusLabel from 'components/UI/StatusLabel';
import Button from 'components/UI/Button';
import { IconNames } from 'components/UI/Icon';

export const RowContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RowContentInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-right: 20px;
`;

export const RowTitle = styled(T)`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 24px;
  margin-right: 10px;
`;

const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

export const ActionsRowContainer = styled.div`
  display: flex;
`;

export const RowButton = styled(Button)`
  margin-left: 7px;
`;

interface Props {
  project: IProjectData;
  actions?: ({ buttonContent: JSX.Element, handler: (projectId: string) => () => void, icon: IconNames } | 'manage')[];
}

export default ({ project, actions }: Props) => {
  const ManageButton = (
    <RowButton
      className={`e2e-admin-edit-project ${project.attributes.title_multiloc['en-GB'] || ''} ${project.attributes.process_type === 'timeline' ? 'timeline' : 'continuous'}`}
      linkTo={`/admin/projects/${project.id}/edit`}
      buttonStyle="secondary"
      icon="edit"
      type="button"
      key="manage"
    >
      <FormattedMessage {...messages.editButtonLabel} />
    </RowButton>
  );

  return (
    <RowContent className="e2e-admin-projects-list-item">
      <RowContentInner className="expand primary">
        <RowTitle value={project.attributes.title_multiloc} />
        {project.attributes.visible_to === 'groups' &&
          <GetProjectGroups projectId={project.id}>
            {(projectGroups) => {
              if (!isNilOrError(projectGroups)) {
                return (
                  <StyledStatusLabel
                    text={projectGroups.length > 0 ? (
                      <FormattedMessage {...messages.xGroupsHaveAccess} values={{ groupCount: projectGroups.length }} />
                    ) : (
                        <FormattedMessage {...messages.onlyAdminsCanView} />
                      )}
                    color="clBlue"
                    icon="lock"
                  />
                );
              }

              return null;
            }}
          </GetProjectGroups>
        }

        {project.attributes.visible_to === 'admins' &&
          <StyledStatusLabel
            text={<FormattedMessage {...messages.onlyAdminsCanView} />}
            color="clBlue"
            icon="lock"
          />
        }
      </RowContentInner>
      {actions ?
        <ActionsRowContainer>
          {actions.map(action => action === 'manage' ? ManageButton :
            <RowButton
              key={action.icon}
              type="button"
              className={`e2e-admin-edit-project ${project.attributes.title_multiloc['en-GB'] || ''} ${project.attributes.process_type === 'timeline' ? 'timeline' : 'continuous'}`}
              onClick={action.handler(project.id)}
              buttonStyle="secondary"
              icon={action.icon}
            >
              {action.buttonContent}
            </RowButton>)
          }
        </ActionsRowContainer>
        : ManageButton}
    </RowContent>
  );
};
