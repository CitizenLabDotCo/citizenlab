import React, { memo, FormEvent } from 'react';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// services
import { deleteProjectFolder } from 'modules/project_folders/services/projectFolders';

// components
import { RowButton } from './StyledComponents';
import { ButtonContainerProps } from 'components/UI/Button';

// styles
import { colors } from 'utils/styleUtils';

interface Props extends ButtonContainerProps {
  publication: IAdminPublicationContent;
  setDeleteIsProcessing: (status: boolean) => void;
  setDeletionError: (error: string) => void;
}

const DeleteProjectFolderButton = memo<Props & InjectedIntlProps>(
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
        iconHoverColor={colors.clRedError}
        textHoverColor={colors.clRedError}
        {...rest}
      >
        {deletionProps.copy}
      </RowButton>
    );
  }
);

export default injectIntl(DeleteProjectFolderButton);
