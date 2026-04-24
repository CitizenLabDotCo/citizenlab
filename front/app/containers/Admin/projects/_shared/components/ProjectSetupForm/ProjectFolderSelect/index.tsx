import React from 'react';

import { Select, IconTooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';

import useLocalize from 'hooks/useLocalize';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

interface Props {
  folder_id?: string | null;
  onChange: (folder_id: string | null) => void;
}

const ProjectFolderSelect = ({ folder_id, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: projectFolders } = useInfiniteProjectFoldersAdmin({}, 10000);
  const { data: authUser } = useAuthUser();

  const flatFolders = projectFolders?.pages.flatMap((page) => page.data);
  const folderOptions: IOption[] = flatFolders
    ? flatFolders
        .map((folder) => ({
          value: folder.id,
          label: localize(folder.attributes.title_multiloc),
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, {
            sensitivity: 'base',
            numeric: true,
          })
        )
    : [];

  const handleSelectFolderChange = ({ value }) => {
    onChange(value);
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
