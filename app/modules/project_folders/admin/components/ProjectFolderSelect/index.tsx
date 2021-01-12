import React, { ReactElement, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';

// services
import { isAdmin } from 'services/permissions/roles';
import { IUpdatedProjectProperties } from 'services/projects';

// components
import { Select, IconTooltip } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

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

interface Props {
  onChange: (value: string) => void;
  projectAttrs: IUpdatedProjectProperties;
}

const ProjectFolderSelect = memo<InjectedIntlProps & Props>(
  ({ projectAttrs, onChange, intl: { formatMessage } }): ReactElement => {
    const { projectFolders } = useProjectFolders({});
    const authUser = useAuthUser();
    const localize = useLocalize();

    const noFolderOption = {
      value: '',
      label: formatMessage(messages.noFolder),
    };

    const folderOptions = useMemo(() => {
      if (!isNilOrError(projectFolders)) {
        return projectFolders.map((folder) => ({
          value: folder.id,
          label: localize(folder.attributes.title_multiloc),
        }));
      }

      return [];
    }, [projectFolders]);

    const allOptions = useMemo<IOption[]>(() => {
      if (isAdmin(authUser)) {
        return [noFolderOption, ...folderOptions];
      }

      return folderOptions;
    }, [folderOptions, noFolderOption, authUser]);

    const defaultValue = useMemo<string>(() => {
      if (isAdmin(authUser) || !folderOptions[0]) {
        return '';
      }

      return folderOptions[0].value;
    }, [folderOptions, noFolderOption, authUser]);

    const handleChange = useCallback(
      ({ value }: IOption) => {
        if (typeof value === 'string') {
          onChange(value);
        }
      },
      [onChange]
    );

    return (
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.folder} />
          {isAdmin(authUser) && <FormattedMessage {...messages.optional} />}
          <IconTooltip
            content={<FormattedMessage {...messages.folderTooltip} />}
          />
        </SubSectionTitle>
        <Select
          value={projectAttrs.folder_id || defaultValue}
          options={allOptions}
          onChange={handleChange}
        />
      </StyledSectionField>
    );
  }
);

export default injectIntl(ProjectFolderSelect);
