import React, { useId, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useAddProjectGroup from 'api/project_groups/useAddProjectGroup';
import { IProject } from 'api/projects/types';
import useAddProject from 'api/projects/useAddProject';

import NewProjectForm, {
  NewProjectValues,
} from 'containers/Admin/projects/_shared/components/NewProjectForm';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import Outlet from 'components/Outlet';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isCLErrorsWrapper } from 'utils/errorUtils';

import messages from './messages';

export type NewProjectMode = 'scratch' | 'template';

interface Props {
  mode: NewProjectMode | null;
  onClose: () => void;
}

const NewProjectModal = ({ mode, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const formId = useId();
  const { mutateAsync: addProject } = useAddProject();
  const { mutateAsync: addProjectGroup } = useAddProjectGroup();

  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});

  const close = () => {
    setProcessing(false);
    setFailed(false);
    setApiErrors({});
    onClose();
  };

  const handleSubmit = async ({
    groupIds,
    ...attributes
  }: NewProjectValues) => {
    setProcessing(true);
    setFailed(false);
    setApiErrors({});

    let project: IProject;

    try {
      project = await addProject({
        ...attributes,
        admin_publication_attributes: { publication_status: 'draft' },
      });
      await Promise.all(
        groupIds.map((groupId) =>
          addProjectGroup({ groupId, projectId: project.data.id })
        )
      );
    } catch (error) {
      setApiErrors(isCLErrorsWrapper(error) ? error.errors : {});
      setFailed(true);
      setProcessing(false);
      return;
    }

    clHistory.push(adminProjectsProjectPath(project.data.id));
    close();
  };

  return (
    <>
      <Modal
        opened={mode === 'scratch'}
        close={close}
        width={560}
        variant="bo"
        header={formatMessage(messages.newProject)}
        footer={
          <Box w="100%" display="flex" justifyContent="flex-end">
            <Button
              buttonStyle="bo-primary"
              type="submit"
              form={formId}
              processing={processing}
            >
              {formatMessage(messages.createProject)}
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <NewProjectForm
            id={formId}
            failed={failed}
            apiErrors={apiErrors}
            onSubmit={handleSubmit}
          />
        </Box>
      </Modal>

      <Modal
        opened={mode === 'template'}
        close={close}
        width={1000}
        header={formatMessage(messages.fromTemplate)}
      >
        <Box p="24px">
          <Outlet
            id="app.containers.Admin.projects.all.createProject"
            selectedTabValue="template"
            onDone={close}
          />
        </Box>
      </Modal>
    </>
  );
};

export default NewProjectModal;
