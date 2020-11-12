import React, { memo, FormEvent } from 'react';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// services
import { deleteProject } from 'services/projects';
import { deleteProjectFolder } from 'modules/projectFolder/services/projectFolders';

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

const DeletePublicationButton = memo<Props & InjectedIntlProps>(
  ({
    publication,
    setDeleteIsProcessing,
    setDeletionError,
    intl: { formatMessage },
    ...rest
  }) => {
    const publicationIsProject = publication.publicationType === 'project';
    const publicationLabel = publicationIsProject ? 'Project' : 'Folder';
    const deletionProps = {
      copy: formatMessage(messages[`delete${publicationLabel}Button`]),
      errorCopy: formatMessage(messages[`delete${publicationLabel}Error`]),
      confirmationCopy: formatMessage(
        messages[`delete${publicationLabel}Confirmation`]
      ),
      handleDelete: publicationIsProject ? deleteProject : deleteProjectFolder,
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

export default injectIntl(DeletePublicationButton);
