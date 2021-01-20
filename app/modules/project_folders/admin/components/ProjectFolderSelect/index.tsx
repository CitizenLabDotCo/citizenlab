import React, { useMemo, memo, useCallback, useState } from 'react';
import styled from 'styled-components';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';

// services
import { IUpdatedProjectProperties } from 'services/projects';
import { isProjectFolderModerator } from 'modules/project_folders/permissions/roles';
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
  }
}

interface Props {
  onChange: onProjectFormStateChange;
  projectAttrs: IUpdatedProjectProperties;
}

const ProjectFolderSelect = memo<Props>(
  ({ projectAttrs: { folder_id }, onChange }) => {
    const { projectFolders } = useProjectFolders({});
    const authUser = useAuthUser();
    const localize = useLocalize();
    const [radioFolderSelect, setRadioFolderSelect] = useState(false);

    const folderOptions: IOption[] = useMemo(() => {
      if (!isNilOrError(projectFolders)) {
        return projectFolders
          .filter(
            (folder) =>
              !isNilOrError(authUser) &&
              isProjectFolderModerator(authUser, folder.id)
          )
          .map((folder) => {
            return {
              value: folder.id,
              label: localize(folder.attributes.title_multiloc),
            };
          });
      }

      return [];
    }, [projectFolders]);

    const handleFolderChange = useCallback(
      ({ value: folderId }) => {
        onChange({ 'projectAttributesDiff.folder_id': folderId });
      },
      [onChange]
    );

    const onRadioFolderSelectChange = useCallback(
      (defaultFolderId) => (newRadioProjectFolderSelect: boolean) => {
        if (newRadioProjectFolderSelect === true) {
          setRadioFolderSelect(true);

          if (!folder_id) {
            onChange({ 'projectAttributesDiff.folder_id': defaultFolderId });
          }
        }

        if (newRadioProjectFolderSelect === false) {
          setRadioFolderSelect(false);
          onChange({ 'projectAttributesDiff.folder_id': null });
        }
      },
      [onChange]
    );

    if (!isNilOrError(authUser) && folderOptions.length > 0) {
      const userIsProjectFolderModerator = isProjectFolderModerator(authUser);
      function getShowProjectFolderSelect() {
        if (userIsProjectFolderModerator) {
          // folder moderators always need to pick a folder
          // when they create a project
          return true;
        } else if (folder_id) {
          // when we already have a folder_id for our project,
          // the project folder select should be turned on
          // so we can see our selected folder.
          // This will not block the UI because when we choose no folder
          // folder_id will be set to null (see onRadioFolderSelectChange)
          return true;
        } else {
          return radioFolderSelect;
        }
      }
      const showProjectFolderSelect = getShowProjectFolderSelect();
      const defaultFolderValue = folderOptions[0].value;

      return (
        <StyledSectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.projectFolderSelectTitle} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.projectFolderSelectTooltip} />
              }
            />
          </SubSectionTitle>
          <Radio
            onChange={onRadioFolderSelectChange(defaultFolderValue)}
            currentValue={showProjectFolderSelect}
            value={false}
            name="folderSelect"
            id="folderSelect-no"
            label={<FormattedMessage {...messages.optionNo} />}
            disabled={userIsProjectFolderModerator}
          />
          <Radio
            onChange={onRadioFolderSelectChange(defaultFolderValue)}
            currentValue={showProjectFolderSelect}
            value={true}
            name="folderSelect"
            id="folderSelect-yes"
            label={<FormattedMessage {...messages.optionYes} />}
            disabled={userIsProjectFolderModerator}
          />
          {showProjectFolderSelect && (
            <Select
              value={folder_id || defaultFolderValue}
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
