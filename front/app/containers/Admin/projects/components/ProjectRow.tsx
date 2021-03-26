import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

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
import { IconNames, StatusLabel } from 'cl2-component-library';
import Error from 'components/UI/Error';

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

interface Props {
  publication: IAdminPublicationContent;
  actions?: (
    | {
        buttonContent: JSX.Element;
        handler: (publicationId: string) => () => void;
        icon: IconNames;
        processing?: boolean;
      }
    | 'manage'
    | 'delete'
  )[];
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

  const ManageButton = (
    <RowButton
      className={`
        e2e-admin-edit-publication
      `}
      linkTo={`/admin/projects/${publication.publicationId}/edit`}
      buttonStyle="secondary"
      icon="edit"
      type="button"
      key="manage"
      disabled={
        isBeingDeleted ||
        (!isNilOrError(authUser) &&
          !canModerateProject(publication.publicationId, { data: authUser }))
      }
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

  const renderRowButton = (action) => (
    <RowButton
      key={action.icon}
      type="button"
      className={[
        'e2e-admin-edit-publication',
        publication.attributes.publication_title_multiloc?.['en-GB'],
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

  return (
    <Container className={className}>
      <RowContent className="e2e-admin-projects-list-item">
        <RowContentInner className="expand primary">
          <RowTitle value={publication.attributes.publication_title_multiloc} />
          {publication.attributes?.publication_visible_to === 'groups' &&
            !isNilOrError(projectGroups) && (
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
                backgroundColor="clBlue"
                icon="lock"
              />
            )}
          {publication.attributes?.publication_visible_to === 'admins' && (
            <StyledStatusLabel
              text={<FormattedMessage {...messages.onlyAdminsCanView} />}
              backgroundColor="clBlue"
              icon="lock"
            />
          )}

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
                return renderRowButton(action);
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
