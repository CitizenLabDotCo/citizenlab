import React, { useMemo, memo, useCallback, useState } from 'react';
import styled from 'styled-components';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';
import useLocalize from 'hooks/useLocalize';
import { IUserData } from 'services/users';

// services
import { IUpdatedProjectProperties } from 'services/projects';
import { userHasRole } from 'services/permissions/roles';
import { isProjectFolderModerator } from 'modules/project_folders/permissions/roles';
import { onProjectFormStateChange } from 'containers/Admin/projects/edit/general';

// components
import { Radio, Select, IconTooltip } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

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
  authUser: IUserData;
}

const ProjectFolderSelect = memo<Props & InjectedIntlProps>(
  ({
    projectAttrs: { folder_id },
    onChange,
    intl: { formatMessage },
    authUser,
  }) => {
    const { projectFolders } = useProjectFolders({});
    const localize = useLocalize();
    const userIsProjectFolderModerator = isProjectFolderModerator(authUser);
    const userIsAdmin = userHasRole({ data: authUser }, 'admin');
    const userIsProjectFolderModeratorNotAdmin =
      userIsProjectFolderModerator && !userIsAdmin;
    const [radioFolderSelect, setRadioFolderSelect] = useState(
      getInitialRadioFolderSelect(
        userIsProjectFolderModeratorNotAdmin,
        folder_id
      )
    );

    function getInitialRadioFolderSelect(
      userIsProjectFolderModeratorNotAdmin: boolean,
      folder_id?: string
    ) {
      if (userIsProjectFolderModeratorNotAdmin) {
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
    const [folderSelected, setFolderSelected] = useState(false);

    const folderOptions: IOption[] = useMemo(() => {
      if (!isNilOrError(projectFolders)) {
        return [
          {
            value: '',
            label: '',
          },
          ...projectFolders
            .filter((folder) => isProjectFolderModerator(authUser, folder.id))
            .map((folder) => {
              return {
                value: folder.id,
                label: localize(folder.attributes.title_multiloc),
              };
            }),
        ];
      }

      return [];
    }, [projectFolders]);

    const handleSelectFolderChange = ({ value: folderId }) => {
      if (typeof folderId === 'string') {
        if (folderId === '') {
          handleFolderIdChange(null, 'disabled');
        } else {
          handleFolderIdChange(folderId, 'enabled');
        }
      }
    };

    const handleFolderIdChange = useCallback(
      (folderId: string | null, submitState: 'enabled' | 'disabled') => {
        if (folderId === null) {
          setFolderSelected(false);
        } else {
          setFolderSelected(true);
        }

        onChange({
          submitState,
          'projectAttributesDiff.folder_id': folderId,
        });
      },
      [onChange]
    );

    const onRadioFolderSelectChange = useCallback(
      (newRadioProjectFolderSelect: boolean) => {
        if (newRadioProjectFolderSelect === true) {
          setRadioFolderSelect(true);
          handleFolderIdChange(null, 'disabled');
        }

        if (newRadioProjectFolderSelect === false) {
          setRadioFolderSelect(false);
          handleFolderIdChange(null, 'enabled');
        }
      },
      [onChange]
    );

    if (folderOptions.length > 0) {
      const defaultFolderSelectOptionValue = folderOptions[0].value;

      return (
        <StyledSectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.projectFolderSelectTitle} />
            <IconTooltip
              content={
                <FormattedMessage
                  {...(userIsProjectFolderModeratorNotAdmin
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
            disabled={userIsProjectFolderModeratorNotAdmin}
          />
          <Radio
            onChange={onRadioFolderSelectChange}
            currentValue={radioFolderSelect}
            value={true}
            name="folderSelect"
            id="folderSelect-yes"
            label={<FormattedMessage {...messages.optionYes} />}
            disabled={userIsProjectFolderModeratorNotAdmin}
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
  }
);

export default injectIntl(ProjectFolderSelect);
