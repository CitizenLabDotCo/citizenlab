import React from 'react';

import { Select, IconTooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolders from 'api/project_folders/useProjectFolders';
import { IUpdatedProjectProperties } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { TOnProjectAttributesDiffChangeFunction } from 'containers/Admin/projects/project/general';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';

import messages from './messages';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;
interface Props {
  projectAttrs: IUpdatedProjectProperties;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
}

const ProjectFolderSelect = ({
  projectAttrs: { folder_id },
  onProjectAttributesDiffChange,
}: Props) => {
  const { data: projectFolders } = useProjectFolders({});
  const { data: authUser } = useAuthUser();

  const userCanCreateProjectInFolderOnly = usePermission({
    item: 'project_folder',
    action: 'create_project_in_folder_only',
  });

  const localize = useLocalize();

  const noFolderId = '/'; // This sentinel must not be a valid folder id.
  const noFolderOption = { value: noFolderId, label: '— No folder —' };
  const folderOptions: IOption[] = projectFolders?.data
    ? [
        noFolderOption,
        ...projectFolders.data
          .filter((folder) => userModeratesFolder(authUser, folder.id))
          .map((folder) => ({
            value: folder.id,
            label: localize(folder.attributes.title_multiloc),
          })),
      ]
    : [];

  const handleSelectFolderChange = ({ value }) => {
    const folderId = value === noFolderId ? null : value;
    onProjectAttributesDiffChange({ folder_id: folderId }, 'enabled');
  };

  if (folderOptions.length === 0) return null;

  const defaultFolderSelectOptionValue = folderOptions[0].value;

  return (
    <StyledSectionField
      data-testid="projectFolderSelect"
      data-cy="e2e-project-folder-setting-field"
    >
      <SubSectionTitle>
        <FormattedMessage {...messages.projectFolderSelectTitle} />
        <IconTooltip
          content={
            <FormattedMessage
              {...(userCanCreateProjectInFolderOnly
                ? messages.folderAdminProjectFolderSelectTooltip
                : messages.adminProjectFolderSelectTooltip)}
            />
          }
        />
      </SubSectionTitle>

      <Select
        value={folder_id || defaultFolderSelectOptionValue}
        options={folderOptions}
        onChange={handleSelectFolderChange}
      />
    </StyledSectionField>
  );
};

export default ProjectFolderSelect;
