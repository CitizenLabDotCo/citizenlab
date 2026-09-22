import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IUpdatedProjectProperties } from 'api/projects/types';
import useAddProject from 'api/projects/useAddProject';

import NewProjectForm from 'containers/Admin/projects/_shared/components/NewProjectForm';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import Outlet from 'components/Outlet';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

export type NewProjectMode = 'scratch' | 'template';

interface Props {
  mode: NewProjectMode | null;
  onClose: () => void;
}

const NewProjectModal = ({ mode, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addProject } = useAddProject();

  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);

  const close = () => {
    setProcessing(false);
    setFailed(false);
    onClose();
  };

  const handleSubmit = async (attributes: IUpdatedProjectProperties) => {
    setProcessing(true);
    setFailed(false);

    try {
      const project = await addProject({
        ...attributes,
        admin_publication_attributes: { publication_status: 'draft' },
      });

      clHistory.push(adminProjectsProjectPath(project.data.id));
      close();
    } catch {
      setFailed(true);
      setProcessing(false);
    }
  };

  if (mode === 'template') {
    return (
      <Outlet
        id="app.containers.Admin.projects.all.createProject"
        selectedTabValue="template"
        onClose={close}
      />
    );
  }

  return (
    <Modal
      opened={mode !== null}
      close={close}
      width={600}
      header={formatMessage(messages.fromScratch)}
    >
      <Box p="24px">
        <NewProjectForm
          processing={processing}
          failed={failed}
          onCancel={close}
          onSubmit={handleSubmit}
        />
      </Box>
    </Modal>
  );
};

export default NewProjectModal;
