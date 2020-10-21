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
import DeleteProjectButton from './DeletePublicationButton';
import { IconNames, StatusLabel } from 'cl2-component-library';
import PublicationStatusLabel from './PublicationStatusLabel';

// resources
import GetProjectGroups from 'resources/GetProjectGroups';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
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
      processing={isBeingDeleted}
    >
      <FormattedMessage {...messages.editButtonLabel} />
    </RowButton>
  );
  const publicationStatus = publication.attributes.publication_status;

  const DeleteButton = (
    <DeleteProjectButton
      publication={publication}
      setDeleteIsProcessing={setIsBeingDeleted}
      processing={isBeingDeleted}
    />
  );

  const renderRowButton = (action) => (
    <RowButton
      key={action.icon}
      type="button"
      className={`
                e2e-admin-edit-publication
                ${
                  publication.attributes.publication_title_multiloc?.[
                    'en-GB'
                  ] || ''
                }
              `}
      onClick={action.handler(publication.publicationId)}
      buttonStyle="secondary"
      icon={action.icon}
      processing={action.processing || isBeingDeleted}
    >
      {action.buttonContent}
    </RowButton>
  );

  return (
    <RowContent className={`e2e-admin-projects-list-item ${className}`}>
      <RowContentInner className="expand primary">
        <RowTitle value={publication.attributes.publication_title_multiloc} />
        {publication.attributes?.publication_visible_to === 'groups' && (
          <GetProjectGroups projectId={publication.publicationId}>
            {(projectGroups) => {
              if (!isNilOrError(projectGroups)) {
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
                    backgroundColor="clBlue"
                    icon="lock"
                  />
                );
              }

              return null;
            }}
          </GetProjectGroups>
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
  );
};
