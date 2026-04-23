import React from 'react';

import { Select, IconTooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import { IUpdatedProjectProperties } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { TOnProjectAttributesDiffChangeFunction } from 'containers/Admin/projects/project/general';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

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
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: projectFolders } = useInfiniteProjectFoldersAdmin({}, 10000);
  const { data: authUser } = useAuthUser();

  const noFolderId = '/'; // This sentinel must not be a valid folder id.
  const noFolderLabel = formatMessage(messages.noFolderLabel);
  const noFolderOption = { value: noFolderId, label: noFolderLabel };

  const flatFolders = projectFolders?.pages.flatMap((page) => page.data);
  const folderOptions: IOption[] = flatFolders
    ? [
        noFolderOption,
        ...flatFolders
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

  const isAdminUser = isAdmin(authUser);

  if (folderOptions.length === 0) return null;

  const defaultFolderSelectOptionValue = folderOptions[0].value;

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
      />
    </StyledSectionField>
  );
};

export default ProjectFolderSelect;
