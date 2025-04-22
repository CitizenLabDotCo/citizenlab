import React from 'react';

// TODO: tooltips
// TODO: projects cannot be deleted on demo.stg
// TODO: user is made an admin when there is no seat available

import { Select, IconTooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolders from 'api/project_folders/useProjectFolders';
import { IUpdatedProjectProperties } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { TOnProjectAttributesDiffChangeFunction } from 'containers/Admin/projects/project/general';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import {
  isProjectFolderModerator,
  userModeratesFolder,
} from 'utils/permissions/rules/projectFolderPermissions';

import messages from './messages';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;
interface Props {
  projectAttrs: IUpdatedProjectProperties;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
  isNewProject: boolean;
}

const ProjectFolderSelect = ({
  projectAttrs: { folder_id },
  onProjectAttributesDiffChange,
  isNewProject,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: projectFolders } = useProjectFolders({});
  const { data: authUser } = useAuthUser();

  const noFolderId = '/'; // This sentinel must not be a valid folder id.
  const noFolderLabel = formatMessage(messages.noFolderLabel);
  const noFolderOption = { value: noFolderId, label: noFolderLabel };

  const folderOptions: IOption[] = projectFolders?.data
    ? [
        noFolderOption,
        ...projectFolders.data
          .filter((folder) => userModeratesFolder(authUser, folder.id))
          .map((folder) => ({
            value: folder.id,
            label: localize(folder.attributes.title_multiloc),
          }))
          .sort((a, b) =>
            a.label.localeCompare(b.label, undefined, {
              sensitivity: 'base',
              numeric: true,
            })
          ),
      ]
    : [];

  const handleSelectFolderChange = ({ value }) => {
    const folderId = value === noFolderId ? null : value;
    onProjectAttributesDiffChange({ folder_id: folderId }, 'enabled');
  };

  if (folderOptions.length === 0) return null;

  const defaultFolderSelectOptionValue = folderOptions[0].value;
  const isAdminUser = isAdmin(authUser);
  const isFolderModerator = isProjectFolderModerator(authUser);
  const selectEnabled = isAdminUser || (isNewProject && isFolderModerator);

  const sectionTooltip = formatMessage(
    isAdminUser
      ? messages.adminProjectFolderSelectTooltip
      : messages.folderAdminProjectFolderSelectTooltip
  );

  return (
    <StyledSectionField
      data-testid="projectFolderSelect"
      data-cy="e2e-project-folder-setting-field"
    >
      <SubSectionTitle>
        <FormattedMessage {...messages.projectFolderSelectTitle} />
        <IconTooltip content={sectionTooltip} />
      </SubSectionTitle>

      <Select
        value={folder_id || defaultFolderSelectOptionValue}
        options={folderOptions}
        onChange={handleSelectFolderChange}
        disabled={!selectEnabled}
      />
    </StyledSectionField>
  );
};

export default ProjectFolderSelect;
