import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';

// services
import { IUpdatedProjectProperties } from 'services/projects';
import { hasProjectFolderModeratorRole } from 'modules/project_folders/permissions/roles';
import { onProjectFormStateChange } from 'containers/Admin/projects/edit/general';

// components
import { Radio, Select, IconTooltip } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

declare module 'services/projects' {
  export interface IProjectFormState {
    folder_id?: string;
    addProjectToFolder: boolean;
  }
}

interface Props {
  onChange: onProjectFormStateChange;
  projectAttrs: IUpdatedProjectProperties;
  addProjectToFolder: boolean;
}

const ProjectFolderSelect = memo<Props>(
  ({ projectAttrs: { folder_id }, onChange, ...props }) => {
    const { projectFolders } = useProjectFolders({});
    const authUser = useAuthUser();
    const localize = useLocalize();

    const folderOptions: IOption[] = useMemo(() => {
      if (!isNilOrError(projectFolders)) {
        return projectFolders.map((folder) => ({
          value: folder.id,
          label: localize(folder.attributes.title_multiloc),
        }));
      }

      return [];
    }, [projectFolders]);

    const handleFolderChange = useCallback(
      ({ value: folderId }) => {
        onChange({ 'projectAttributesDiff.folder_id': folderId });
      },
      [onChange]
    );

    const onAddProjectToFolderChange = useCallback(
      (defaultFolderValue: string) => (addProjectToFolder: boolean) => {
        const projectFormStateUpdates = {
          addProjectToFolder,
        };

        if (!folder_id) {
          projectFormStateUpdates[
            'projectAttributesDiff.folder_id'
          ] = defaultFolderValue;
        }

        if (addProjectToFolder === false) {
          projectFormStateUpdates['projectAttributesDiff.folder_id'] = null;
        }

        onChange(projectFormStateUpdates);
      },
      [onChange]
    );

    if (!isNilOrError(authUser) && folderOptions.length > 0) {
      const userIsProjectFolderModerator = hasProjectFolderModeratorRole(
        authUser
      );
      function showProjectFolderSelect() {
        if (userIsProjectFolderModerator) {
          return true;
        } else if (folder_id !== null || folder_id !== undefined) {
          return true;
        } else {
          return props.addProjectToFolder;
        }
      }
      const addProjectToFolder = showProjectFolderSelect();
      const defaultFolderValue = folderOptions[0].value;

      return (
        <StyledSectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.projectFolder} />
            <IconTooltip
              content={<FormattedMessage {...messages.projectFolderTooltip} />}
            />
          </SubSectionTitle>
          <Radio
            onChange={onAddProjectToFolderChange(defaultFolderValue)}
            currentValue={addProjectToFolder}
            value={false}
            name="folderSelect"
            id="folderSelect-no"
            label={<FormattedMessage {...messages.no} />}
            disabled={userIsProjectFolderModerator}
          />
          <Radio
            onChange={onAddProjectToFolderChange(defaultFolderValue)}
            currentValue={addProjectToFolder}
            value={true}
            name="folderSelect"
            id="folderSelect-yes"
            label={<FormattedMessage {...messages.yes} />}
            disabled={userIsProjectFolderModerator}
          />
          {addProjectToFolder && (
            <Select
              value={folder_id}
              options={folderOptions}
              onChange={handleFolderChange}
            />
          )}
        </StyledSectionField>
      );
    }

    return null;
  }
);

export default ProjectFolderSelect;
