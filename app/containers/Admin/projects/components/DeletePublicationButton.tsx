import React, { memo, FormEvent, useState } from 'react';
import { deleteProject } from 'services/projects';
import { RowButton } from './StyledComponents';

import { ButtonContainerProps } from 'components/UI/Button';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

interface Props extends ButtonContainerProps {
  publication: IAdminPublicationContent;
  setDeleteIsProcessing: (status: boolean) => void;
}

const DeletePublicationButton = memo<Props & InjectedIntlProps>(
  ({
    publication,
    setDeleteIsProcessing,
    intl: { formatMessage },
    ...rest
  }) => {
    const [deleteRequestError, setDeleteRequestError] = useState<string>('');

    const handleDeleteProject = async (event: FormEvent<any>) => {
      event.preventDefault();

      if (
        publication &&
        window.confirm(formatMessage(messages.deleteProjectConfirmation))
      ) {
        try {
          setDeleteIsProcessing(true);
          await deleteProject(publication.id);
          setDeleteRequestError('');
        } catch {
          setDeleteIsProcessing(false);
          setDeleteRequestError(formatMessage(messages.deleteProjectError));
        }
      }
    };

    return (
      <RowButton
        onClick={handleDeleteProject}
        type="button"
        icon="delete"
        buttonStyle="text"
        className={`e2e-admin-delete-publication`}
        {...rest}
      >
        {formatMessage(messages.deleteProjectButton)}
      </RowButton>
    );
  }
);

export default injectIntl(DeletePublicationButton);
