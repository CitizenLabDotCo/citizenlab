import React, { memo, FormEvent, useState } from 'react';
import Button from 'components/UI/Button';
import HasPermission from 'components/HasPermission';
import { IProject, deleteProject } from 'services/projects';
import clHistory from 'utils/cl-router/history';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  project: IProject;
}

type TDeleteRequestState = {
  processing: boolean;
  error: string;
};

const DeleteProjectButton = memo<Props & InjectedIntlProps>(
  ({ project, intl: { formatMessage } }) => {
    const [deleteRequestState, setDeleteRequestState] = useState<
      TDeleteRequestState
    >({
      processing: false,
      error: '',
    });

    const handleDeleteProject = async (event: FormEvent<any>) => {
      event.preventDefault();

      if (
        project &&
        window.confirm(formatMessage(messages.deleteProjectConfirmation))
      ) {
        try {
          setDeleteRequestState({ ...deleteRequestState, processing: true });
          await deleteProject(project.data.id);
          clHistory.push('/admin/projects');
        } catch {
          setDeleteRequestState({
            ...deleteRequestState,
            processing: true,
            error: formatMessage(messages.deleteProjectError),
          });
        }
      }
    };

    return (
      <HasPermission item={project.data} action="delete">
        <button onClick={handleDeleteProject}>delete</button>
      </HasPermission>
    );
  }
);

export default injectIntl(DeleteProjectButton);
