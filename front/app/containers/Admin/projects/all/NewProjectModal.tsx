import React, { useId, useState } from 'react';

import { CLErrors } from 'typings';

import useAddProjectGroup from 'api/project_groups/useAddProjectGroup';
import { IProject } from 'api/projects/types';
import useAddProject from 'api/projects/useAddProject';

import NewProjectForm, {
  NewProjectValues,
} from 'containers/Admin/projects/_shared/components/NewProjectForm';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import Outlet from 'components/Outlet';

import Modal from 'design-system/Modal';
import 'design-system/tokens.css';

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
    const results = await Promise.allSettled(
      groupIds.map((groupId) => addProjectGroup({ groupId, projectId }))
    );
    const failedGroupIds = groupIds.filter(
      (_groupId, index) => results[index].status === 'rejected'
    );

    if (failedGroupIds.length > 0) {
      clHistory.push(
        `/admin/projects/${projectId}/project-page?groups_failed=${failedGroupIds.join(
          ','
        )}`
      );
    } else {
      clHistory.push(adminProjectsProjectPath(projectId));
    }
    close();
  };

  const closeOnDismiss = (isOpen: boolean) => {
    if (!isOpen) close();
  };

  return (
    <>
      <Modal
        size={560}
        isOpen={mode === 'scratch'}
        onOpenChange={closeOnDismiss}
        title={formatMessage(messages.newProject)}
        primaryAction={{
          label: formatMessage(messages.createProject),
          type: 'submit',
          form: formId,
          isPending: processing,
        }}
      >
        <NewProjectForm
          id={formId}
          failed={failed}
          apiErrors={apiErrors}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        size={920}
        isOpen={mode === 'template'}
        onOpenChange={closeOnDismiss}
        title={formatMessage(messages.fromTemplate)}
      >
        <Outlet
          id="app.containers.Admin.projects.all.createProject"
          selectedTabValue="template"
          onDone={close}
          variant="panel"
        />
      </Modal>
    </>
  );
};

export default NewProjectModal;
