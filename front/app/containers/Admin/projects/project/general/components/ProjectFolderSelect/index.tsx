import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TOnProjectAttributesDiffChangeFunction } from 'containers/Admin/projects/project/general';

// hooks
import useProjectFolders from 'api/project_folders/useProjectFolders';
import useLocalize from 'hooks/useLocalize';
import { usePermission } from 'utils/permissions';

// services
import { IUpdatedProjectProperties } from 'api/projects/types';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';

// components
import {
  Radio,
  Select,
  IconTooltip,
  Error,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

// utils
import { isNilOrError, isNil } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';
import useAuthUser from 'api/me/useAuthUser';

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
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: projectFolders } = useProjectFolders({});
  const { data: authUser } = useAuthUser();

  const userCanCreateProjectInFolderOnly = usePermission({
    item: 'project_folder',
    action: 'create_project_in_folder_only',
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
      if (userCanCreateProjectInFolderOnly) {
        // folder moderators always need to pick a folder
        // when they create a project
        return true;
      } else if (folder_id) {
        // when we already have a folder_id for our project,
        // the project folder select should be turned on
        // so we can see our selected folder.
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
  ]);

  if (isNilOrError(authUser)) {
    return null;
  }

  const folderOptions: IOption[] =
    !isNilOrError(projectFolders) && !isNilOrError(projectFolders?.data)
      ? [
          {
            value: '',
            label: '',
          },
          ...projectFolders.data
            .filter((folder) => userModeratesFolder(authUser.data, folder.id))
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
          disabled={userCanCreateProjectInFolderOnly}
        />
        <Radio
          onChange={onRadioFolderSelectChange}
          currentValue={radioFolderSelect}
          value={true}
          name="folderSelect"
          id="folderSelect-yes"
          label={<FormattedMessage {...messages.optionYes} />}
          disabled={userCanCreateProjectInFolderOnly}
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

export default injectIntl(ProjectFolderSelect);
