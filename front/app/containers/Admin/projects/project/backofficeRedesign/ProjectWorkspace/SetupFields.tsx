import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import { IProjectData, Visibility } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import ProjectContextInner from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/Inner';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const LISTED = 'listed';
const UNLISTED = 'unlisted';

interface Props {
  project: IProjectData;
}

const SetupFields = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { mutate: updateProject } = useUpdateProject();

  const { listed, visible_to, space_id, folder_id } = project.attributes;

  const findOptions: IOption[] = [
    { value: LISTED, label: formatMessage(messages.publishFindPublic) },
    { value: UNLISTED, label: formatMessage(messages.publishFindPrivate) },
  ];

  const openOptions: IOption[] = [
    { value: 'public', label: formatMessage(messages.publishOpenEveryone) },
    { value: 'admins', label: formatMessage(messages.publishOpenAdmins) },
    { value: 'groups', label: formatMessage(messages.publishOpenGroups) },
  ];

  const canEditContext =
    authUser && authUser.data.attributes.highest_role !== 'project_moderator';

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      <Select
        label={formatMessage(messages.publishWhoCanFind)}
        value={listed ? LISTED : UNLISTED}
        options={findOptions}
        onChange={({ value }: IOption) =>
          updateProject({ projectId: project.id, listed: value === LISTED })
        }
        className="e2e-setup-fields-listed"
      />

      <Select
        label={formatMessage(messages.publishWhoCanOpen)}
        value={visible_to}
        options={openOptions}
        onChange={({ value }: IOption) =>
          updateProject({
            projectId: project.id,
            visible_to: value as Visibility,
          })
        }
        className="e2e-setup-fields-visible-to"
      />

      {canEditContext && (
        <ProjectContextInner
          spaceId={space_id}
          folderId={folder_id}
          projectInRoot={!space_id && !folder_id}
          error={false}
          onChange={(spaceAndFolderId) =>
            updateProject({ projectId: project.id, ...spaceAndFolderId })
          }
        />
      )}
    </Box>
  );
};

export default SetupFields;
