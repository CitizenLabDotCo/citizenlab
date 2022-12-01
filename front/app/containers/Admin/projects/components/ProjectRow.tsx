import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
  ActionsRowContainer,
} from './StyledComponents';
import DeleteProjectButton from './DeleteProjectButton';
import PublicationStatusLabel from './PublicationStatusLabel';
import { IconNames, StatusLabel } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Link from 'utils/cl-router/Link';

// resources
import useProjectGroups from 'hooks/useProjectGroups';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
import useAuthUser from 'hooks/useAuthUser';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type CustomButtonAction = {
  buttonContent: JSX.Element;
  handler: (publicationId: string) => () => void;
  icon: IconNames;
  processing?: boolean;
};
type ButtenAction = CustomButtonAction | 'manage' | 'delete';

interface Props {
  publication: IAdminPublicationContent;
  actions?: ButtenAction[];
  hidePublicationStatusLabel?: boolean;
  className?: string;
}

export default ({
  publication,
  actions,
  hidePublicationStatusLabel,
  className,
}: Props) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState<boolean>(false);
  const [deletionError, setDeletionError] = useState<string>('');
  const authUser = useAuthUser();

  const projectGroups = useProjectGroups({
    projectId: publication.publicationId,
  });

  const userCanModerateProject =
    !isNilOrError(authUser) &&
    canModerateProject(publication.publicationId, { data: authUser });

  const ManageButton = (
    <RowButton
      className={`
        e2e-admin-edit-publication intercom-admin-project-edit-button
      `}
      linkTo={adminProjectsProjectPath(publication.publicationId)}
      buttonStyle="secondary"
      icon="edit"
      type="button"
      key="manage"
      disabled={isBeingDeleted || !userCanModerateProject}
    >
      <FormattedMessage {...messages.editButtonLabel} />
    </RowButton>
  );

  const publicationStatus = publication.attributes.publication_status;

  const DeleteButton = (
    <DeleteProjectButton
      publication={publication}
      setDeleteIsProcessing={setIsBeingDeleted}
      setDeletionError={setDeletionError}
      processing={isBeingDeleted}
      key="delete"
    />
  );

  const GroupsTag = () => {
    if (
      publication.attributes?.publication_visible_to !== 'groups' ||
      isNilOrError(projectGroups)
    ) {
      return null;
    }

    const GroupStatusLabel = () => {
      return (
        <StyledStatusLabel
          text={
            projectGroups.length > 0 ? (
              <FormattedMessage
                {...messages.xGroupsHaveAccess}
                values={{ groupCount: projectGroups.length }}
              />
            ) : (
              <FormattedMessage {...messages.onlyAdminsCanView} />
            )
          }
          backgroundColor={colors.teal}
          icon="lock"
        />
      );
    };

    if (userCanModerateProject) {
      return (
        <Link
          to={`${adminProjectsProjectPath(
            publication.publicationId
          )}/permissions`}
        >
          <GroupStatusLabel />
        </Link>
      );
    }

    return <GroupStatusLabel />;
  };

  const AdminTag = () => {
    if (publication.attributes?.publication_visible_to !== 'admins') {
      return null;
    }

    const AdminStatusLabel = () => {
      return (
        <StyledStatusLabel
          text={<FormattedMessage {...messages.onlyAdminsCanView} />}
          backgroundColor={colors.teal}
          icon="lock"
        />
      );
    };

    if (userCanModerateProject) {
      return (
        <Link
          to={`${adminProjectsProjectPath(
            publication.publicationId
          )}/permissions`}
        >
          <AdminStatusLabel />
        </Link>
      );
    }

    return <AdminStatusLabel />;
  };

  return (
    <Container className={className}>
      <RowContent className="e2e-admin-projects-list-item">
        <RowContentInner className="expand primary">
          <RowTitle value={publication.attributes.publication_title_multiloc} />
          <GroupsTag />
          <AdminTag />
          {!hidePublicationStatusLabel && (
            <PublicationStatusLabel publicationStatus={publicationStatus} />
          )}
        </RowContentInner>
        {actions ? (
          <ActionsRowContainer>
            {actions.map((action) => {
              if (action === 'delete') {
                return DeleteButton;
              } else if (action === 'manage') {
                return ManageButton;
              } else {
                return (
                  <RowButton
                    data-cy={`e2e-manage-button-${publication.publicationId}`}
                    key={action.icon}
                    type="button"
                    className={[
                      'e2e-admin-edit-publication',
                      publication.attributes.publication_title_multiloc?.[
                        'en-GB'
                      ],
                    ]
                      .filter((item) => item)
                      .join(' ')}
                    onClick={action.handler(publication.publicationId)}
                    buttonStyle="secondary"
                    icon={action.icon}
                    processing={action.processing}
                    disabled={isBeingDeleted}
                  >
                    {action.buttonContent}
                  </RowButton>
                );
              }
            })}
          </ActionsRowContainer>
        ) : (
          ManageButton
        )}
      </RowContent>
      {deletionError && <Error text={deletionError} />}
    </Container>
  );
};
