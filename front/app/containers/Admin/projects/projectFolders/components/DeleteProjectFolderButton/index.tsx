import React, { memo, FormEvent } from 'react';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// services
import { deleteProjectFolder } from 'services/projectFolders';

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

const DeleteProjectFolderButton = memo<Props & WrappedComponentProps>(
  ({
    publication,
    setDeleteIsProcessing,
    setDeletionError,
    intl: { formatMessage },
    ...rest
  }) => {
    const handleDeletePublication = async (event: FormEvent<any>) => {
      event.preventDefault();

      if (
        publication &&
        window.confirm(formatMessage(messages.deleteFolderConfirmation))
      ) {
        try {
          setDeleteIsProcessing(true);
          await deleteProjectFolder(publication.publicationId);
          setDeleteIsProcessing(false);
          setDeletionError('');
        } catch {
          setDeleteIsProcessing(false);
          setDeletionError(formatMessage(messages.deleteFolderError));
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
        {formatMessage(messages.deleteFolderButton)}
      </RowButton>
    );
  }
);

export default injectIntl(DeleteProjectFolderButton);
