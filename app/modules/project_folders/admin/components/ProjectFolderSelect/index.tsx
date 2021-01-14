import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';

// services
import { isAdmin } from 'services/permissions/roles';
import { IUpdatedProjectProperties } from 'services/projects';

// components
import { Select, IconTooltip, Checkbox } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import MultipleSelect from 'components/UI/MultipleSelect';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-bottom: 20px;
`;

interface Props {
  onChange: (fieldPath: string, value: any) => void;
  projectAttrs: IUpdatedProjectProperties;
}

const ProjectFolderSelect = memo<InjectedIntlProps & Props>(
  ({ projectAttrs: { folder_id }, onChange, intl: { formatMessage } }) => {
    const { projectFolders } = useProjectFolders({});
    const authUser = useAuthUser();
    const localize = useLocalize();

    const noFolderOption = {
      value: '',
      label: formatMessage(messages.noFolder),
    };

    const folderOptions: IOption[] = useMemo(() => {
      if (!isNilOrError(projectFolders)) {
        return projectFolders.map((folder) => ({
          value: folder.id,
          label: localize(folder.attributes.title_multiloc),
        }));
      }

      return [];
    }, [projectFolders]);

    const allOptions = useMemo<IOption[]>(() => {
      if (isAdmin({ data: authUser })) {
        return [...folderOptions];
      }

      return folderOptions;
    }, [folderOptions, noFolderOption, authUser]);

    const defaultValue = useMemo<string>(() => {
      if (isAdmin({ data: authUser }) || !folderOptions[0]) {
        return '';
      }

      return folderOptions[0].value;
    }, [folderOptions, noFolderOption, authUser]);

    const handleChange = useCallback(
      ({ value }) => {
        onChange('projectAttributesDiff.folder_id', value);
      },
      [onChange]
    );

    const handleMultipleSelectChange = useCallback(
      (options: IOption[]) => {
        options.forEach((option) => {
          const { value } = option;
          if (typeof value === 'string') {
            onChange(value);
          }
        });
      },
      [onChange]
    );

    const getFolderOption = (folderOptions: IOption[], folderId: string) => {
      const folderOption = folderOptions.find(
        (folderOption: IOption) => folderOption.value === folderId
      );

      return folderOption;
    };

    const onCheckProjectFolder = () => {};

    if (folderOptions.length > 0) {
      return (
        <StyledSectionField>
          <SubSectionTitle>
            <FormattedMessage
              {...messages.projectFolder}
              values={{
                optional: isAdmin({ data: authUser })
                  ? formatMessage(messages.optional)
                  : '',
              }}
            />
            <IconTooltip
              content={<FormattedMessage {...messages.folderTooltip} />}
            />
          </SubSectionTitle>
          {/* {isAdmin(authUser) ? (
            <MultipleSelect
              value={
                folder_id ? getFolderOption(folderOptions, folder_id) : null
              }
              options={allOptions}
              onChange={handleMultipleSelectChange}
              max={1}
            />
          ) : ( */}
          <StyledCheckbox
            checked={false}
            onChange={onCheckProjectFolder}
            label={'Add to folder?'}
          />
          <Select
            value={folder_id || defaultValue}
            options={allOptions}
            onChange={handleSelectChange}
            disabled
          />
          {/* )} */}
        </StyledSectionField>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectFolderSelect);
