import React, { useState, useEffect } from 'react';

import {
  Radio,
  Select,
  IconTooltip,
  Error,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolders from 'api/project_folders/useProjectFolders';
import { IUpdatedProjectProperties } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { TOnProjectAttributesDiffChangeFunction } from 'containers/Admin/projects/project/general';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError, isNil } from 'utils/helperUtils';
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
  isNewProject: boolean;
}

const ProjectFolderSelect = ({
  projectAttrs: { folder_id },
  onProjectAttributesDiffChange,
  isNewProject,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: projectFolders } = useProjectFolders({});
  const { data: authUser } = useAuthUser();

  const userCanCreateProjectInFolderOnly = usePermission({
    item: 'project_folder',
    action: 'create_project_in_folder_only',
  });

  const userCanCreateProjectAtTopLevel = usePermission({
    item: 'project',
    action: 'create',
  });

  const localize = useLocalize();
  // Initially null, the value is set in the useEffect below based on user permissions and folder_id
  const [radioFolderSelect, setRadioFolderSelect] = useState<boolean | null>(
    null
  );
  const [folderSelected, setFolderSelected] = useState(false);

  useEffect(() => {
    function getInitialRadioFolderSelect(
      userCanCreateProjectInFolderOnly: boolean,
      folder_id?: string | null
    ) {
      if (folder_id) {
        // when we already have a folder_id for our project,
        // the project folder select should be turned on
        // so we can see our selected folder.
        return true;
      } else if (isNewProject && userCanCreateProjectInFolderOnly) {
        // folder moderators need to pick a folder
        // only when they create a project
        return true;
      } else {
        return false;
      }
    }
    if (isNil(radioFolderSelect) && !isNilOrError(authUser)) {
      setRadioFolderSelect(
        getInitialRadioFolderSelect(userCanCreateProjectInFolderOnly, folder_id)
      );
    }
  }, [
    radioFolderSelect,
    userCanCreateProjectInFolderOnly,
    folder_id,
    authUser,
    isNewProject,
  ]);

  if (isNilOrError(authUser)) {
    return null;
  }

  const folderOptions: IOption[] =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !isNilOrError(projectFolders) && !isNilOrError(projectFolders?.data)
      ? [
          {
            value: '',
            label: '',
          },
          ...projectFolders.data
            .filter((folder) => userModeratesFolder(authUser, folder.id))
            .map((folder) => {
              return {
                value: folder.id,
                label: localize(folder.attributes.title_multiloc),
              };
            }),
        ]
      : [];

  const handleSelectFolderChange = ({ value: folderId }) => {
    if (typeof folderId === 'string') {
      if (folderId === '') {
        handleFolderIdChange(null, 'disabled');
      } else {
        handleFolderIdChange(folderId, 'enabled');
      }
    }
  };

  const handleFolderIdChange = (
    folderId: string | null,
    submitState: 'enabled' | 'disabled'
  ) => {
    setFolderSelected(folderId ? true : false);

    onProjectAttributesDiffChange({ folder_id: folderId }, submitState);
  };

  const onRadioFolderSelectChange = (newRadioProjectFolderSelect: boolean) => {
    setRadioFolderSelect(newRadioProjectFolderSelect);
    // Not ideal that we set folderId to null.
    // Should probably keep it for better UX.
    handleFolderIdChange(
      null,
      newRadioProjectFolderSelect ? 'disabled' : 'enabled'
    );
  };

  if (folderOptions.length > 0) {
    const defaultFolderSelectOptionValue = folderOptions[0].value;

    return (
      <StyledSectionField data-testid="projectFolderSelect">
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
        <Radio
          onChange={onRadioFolderSelectChange}
          currentValue={radioFolderSelect}
          value={false}
          name="folderSelect"
          id="folderSelect-no"
          label={<FormattedMessage {...messages.optionNo} />}
          disabled={!userCanCreateProjectAtTopLevel}
        />
        <Radio
          onChange={onRadioFolderSelectChange}
          currentValue={radioFolderSelect}
          value={true}
          name="folderSelect"
          id="folderSelect-yes"
          label={<FormattedMessage {...messages.optionYes} />}
          disabled={!userCanCreateProjectAtTopLevel}
        />
        {radioFolderSelect && (
          <Select
            value={folder_id || defaultFolderSelectOptionValue}
            options={folderOptions}
            onChange={handleSelectFolderChange}
          />
        )}
        {radioFolderSelect && !folder_id && !folderSelected && (
          <Error text={formatMessage(messages.folderSelectError)} />
        )}
      </StyledSectionField>
    );
  }

  return null;
};

export default ProjectFolderSelect;
