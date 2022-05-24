import React, { useMemo, memo, useState } from 'react';
import styled from 'styled-components';
import { TOnProjectAttributesDiffChangeFunction } from 'utils/moduleUtils';

// hooks
import { useProjectFolders } from '../../../hooks';
import useLocalize from 'hooks/useLocalize';

// services
import { IUpdatedProjectProperties } from 'services/projects';
import { userHasRole } from 'services/permissions/roles';
import {
  isProjectFolderModerator,
  moderatesFolder,
} from 'modules/commercial/project_folders/permissions/roles';

// components
import { Radio, Select, IconTooltip } from '@citizenlab/cl2-component-library';
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
import useAuthUser from 'hooks/useAuthUser';

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
  projectAttrs: IUpdatedProjectProperties;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
}

const ProjectFolderSelect = memo<Props & InjectedIntlProps>(
  ({
    projectAttrs: { folder_id },
    onProjectAttributesDiffChange,
    intl: { formatMessage },
  }) => {
    const { projectFolders } = useProjectFolders({});
    const authUser = useAuthUser();
    const localize = useLocalize();
    const userIsProjectFolderModerator = !isNilOrError(authUser)
      ? isProjectFolderModerator(authUser)
      : false;
    const userIsAdmin = !isNilOrError(authUser)
      ? userHasRole({ data: authUser }, 'admin')
      : false;
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
            .filter((folder) =>
              moderatesFolder(
                !isNilOrError(authUser) ? authUser : null,
                folder.id
              )
            )
            .map((folder) => {
              return {
                value: folder.id,
                label: localize(folder.attributes.title_multiloc),
              };
            }),
        ];
      }

      return [];
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleFolderIdChange = (
      folderId: string | null,
      submitState: 'enabled' | 'disabled'
    ) => {
      setFolderSelected(folderId ? true : false);

      onProjectAttributesDiffChange(
        { folder_id: folderId || undefined },
        submitState
      );
    };

    const onRadioFolderSelectChange = (
      newRadioProjectFolderSelect: boolean
    ) => {
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
