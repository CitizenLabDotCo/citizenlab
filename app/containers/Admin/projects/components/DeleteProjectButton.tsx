import React, { memo, FormEvent } from 'react';
import Button from 'components/UI/Button';
import HasPermission from 'components/HasPermission';
import { IProject } from 'services/projects';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  project: IProject;
}

const DeleteProjectButton = memo<Props & InjectedIntlProps>(
  ({ project, intl: { formatMessage } }) => {
    const deleteProject = async (event: FormEvent<any>) => {
      event.preventDefault();
    };

    return (
      <HasPermission item={project.data} action="delete">
        <button onClick={deleteProject}>delete</button>
      </HasPermission>
    );
  }
);

export default injectIntl(DeleteProjectButton);
