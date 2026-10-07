import React from 'react';

import { Box, Divider } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useContextPickers from 'containers/Admin/projects/_shared/components/ProjectContextPickers/useContextPickers';
import contextMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/messages';

import { useIntl } from 'utils/cl-intl';

import PanelHeading from '../PanelHeading';

interface Props {
  project: IProjectData;
}

const ContextDropdowns = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject } = useUpdateProject();

  const { space_id: spaceId, folder_id: folderId } = project.attributes;

  const pickers = useContextPickers({
    spaceId,
    folderId,
    projectInRoot: !spaceId && !folderId,
    onChange: (spaceAndFolderId) =>
      updateProject({ projectId: project.id, ...spaceAndFolderId }),
  });

  if (!pickers) return null;

  return (
    <>
      <PanelHeading title={formatMessage(contextMessages.projectContext)} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="8px"
      >
        {pickers.spacePicker}
        {pickers.folderPicker}
        {pickers.approvalWarning}
      </Box>
      <Divider />
    </>
  );
};

export default ContextDropdowns;
