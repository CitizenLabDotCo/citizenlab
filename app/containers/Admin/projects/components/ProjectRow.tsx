import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { RowContent, RowContentInner, RowTitle, RowButton, ActionsRowContainer } from './StyledComponents';
import StatusLabel from 'components/UI/StatusLabel';

// resources
import GetProjectGroups from 'resources/GetProjectGroups';

// types
import { IconNames } from 'components/UI/Icon';
import { IProjectData } from 'services/projects';

const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

// const PublicationStatusLabel = styled(StatusLabel)`
//   margin-left: auto;
//   margin-top: 4px;
//   margin-bottom: 4px;
// `;

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
  const publicationStatus = project.attributes.publication_status;
  const isDraftOrArchivedProject = publicationStatus === 'draft' || publicationStatus === 'archived';

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

        {isDraftOrArchivedProject &&
          <StatusLabel
            text={publicationStatus}
            color="orangered"
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

// TODO: localize pub status?
// TODO: color of status label
