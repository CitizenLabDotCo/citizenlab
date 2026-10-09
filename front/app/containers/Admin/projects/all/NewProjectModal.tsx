import React, { useId, useState } from 'react';

import { Box, Button, bo } from '@citizenlab/cl2-component-library';
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
    if (processing) return;
    setProcessing(true);
    setFailed(false);
    setApiErrors({});

    let project: IProject;

    try {
      project = await addProject({
        ...attributes,
        admin_publication_attributes: { publication_status: 'draft' },
      });
    } catch (error) {
      setApiErrors(isCLErrorsWrapper(error) ? error.errors : {});
      setFailed(true);
      setProcessing(false);
      return;
    }

    const projectId = project.data.id;

    // The project exists at this point, so a group failure must not keep the
    // modal open: submitting again would create a second project.
    try {
      await Promise.all(
        groupIds.map((groupId) => addProjectGroup({ groupId, projectId }))
      );
      clHistory.push(adminProjectsProjectPath(projectId));
    } catch {
      clHistory.push(
        `/admin/projects/${projectId}/project-page?groups_failed=true`
      );
    }
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
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
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
        variant="bo"
        header={formatMessage(messages.fromTemplate)}
      >
        <Box p="24px">
          <Outlet
            id="app.containers.Admin.projects.all.createProject"
            selectedTabValue="template"
            onDone={close}
            variant="bo"
          />
        </Box>
      </Modal>
    </>
  );
};

export default NewProjectModal;
