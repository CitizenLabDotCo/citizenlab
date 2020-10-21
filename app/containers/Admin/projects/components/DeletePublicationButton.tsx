import React, { memo, FormEvent } from 'react';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// services
import { deleteProject } from 'services/projects';
import { deleteProjectFolder } from 'services/projectFolders';

// components
import { RowButton } from './StyledComponents';
import { ButtonContainerProps } from 'components/UI/Button';

interface Props extends ButtonContainerProps {
  publication: IAdminPublicationContent;
  setDeleteIsProcessing: (status: boolean) => void;
  setDeletionError: (error: string) => void;
}

const DeletePublicationButton = memo<Props & InjectedIntlProps>(
  ({
    publication,
    setDeleteIsProcessing,
    setDeletionError,
    intl: { formatMessage },
    ...rest
  }) => {
    const publicationIsProject = publication.publicationType === 'project';

    const handleDeletePublication = async (event: FormEvent<any>) => {
      event.preventDefault();

      const confirmationCopy = publicationIsProject
        ? formatMessage(messages.deleteProjectConfirmation)
        : formatMessage(messages.deleteFolderConfirmation);

      if (publication && window.confirm(confirmationCopy)) {
        try {
          const deleteFunction = publicationIsProject
            ? deleteProject
            : deleteProjectFolder;
          setDeleteIsProcessing(true);
          await deleteFunction(publication.id);
          setDeletionError('');
          setDeleteIsProcessing(false);
        } catch {
          const deletionErrorCopy = publicationIsProject
            ? formatMessage(messages.deleteProjectError)
            : formatMessage(messages.deleteFolderError);
          setDeleteIsProcessing(false);
          setDeletionError(deletionErrorCopy);
        }
      }
    };

    const copy = publicationIsProject
      ? formatMessage(messages.deleteProjectButton)
      : formatMessage(messages.deleteButtonLabel);
    return (
      <RowButton
        onClick={handleDeletePublication}
        type="button"
        icon="delete"
        buttonStyle="text"
        className={`e2e-admin-delete-publication`}
        {...rest}
      >
        {copy}
      </RowButton>
    );
  }
);

export default injectIntl(DeletePublicationButton);
