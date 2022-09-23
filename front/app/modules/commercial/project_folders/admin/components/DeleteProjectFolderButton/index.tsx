import React, { FormEvent, memo } from 'react';

// i18n
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

// services
import { deleteProjectFolder } from '../../../services/projectFolders';

// components
import { ButtonContainerProps } from 'components/UI/Button';
import { RowButton } from './StyledComponents';

// styles
import { colors } from 'utils/styleUtils';

interface Props extends ButtonContainerProps {
  publication: IAdminPublicationContent;
  setDeleteIsProcessing: (status: boolean) => void;
  setDeletionError: (error: string) => void;
}

const DeleteProjectFolderButton = memo<Props & WrappedComponentProps>(
  ({
    publication,
    setDeleteIsProcessing,
    setDeletionError,
    intl: { formatMessage },
    ...rest
  }) => {
    const deletionProps = {
      copy: formatMessage(messages[`deleteFolderButton`]),
      errorCopy: formatMessage(messages[`deleteFolderError`]),
      confirmationCopy: formatMessage(messages[`deleteFolderConfirmation`]),
      handleDelete: deleteProjectFolder,
    };

    const handleDeletePublication = async (event: FormEvent<any>) => {
      event.preventDefault();

      if (publication && window.confirm(deletionProps.confirmationCopy)) {
        try {
          setDeleteIsProcessing(true);
          await deletionProps.handleDelete(publication.publicationId);
          setDeleteIsProcessing(false);
          setDeletionError('');
        } catch {
          setDeleteIsProcessing(false);
          setDeletionError(deletionProps.errorCopy);
        }
      }
    };

    return (
      <RowButton
        onClick={handleDeletePublication}
        type="button"
        icon="delete"
        buttonStyle="text"
        className={`e2e-admin-delete-publication`}
        iconHoverColor={colors.red600}
        textHoverColor={colors.red600}
        {...rest}
      >
        {deletionProps.copy}
      </RowButton>
    );
  }
);

export default injectIntl(DeleteProjectFolderButton);
