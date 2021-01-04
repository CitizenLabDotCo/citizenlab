import React, { ReactElement, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';
import useAuthUser from 'hooks/useAuthUser';
import { isAdmin } from 'services/permissions/roles';

// components
import { Select, IconTooltip } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

// utils
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';
import { IUpdatedProjectProperties } from 'services/projects';

import messages from './messages';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

export interface IProjectFolderSelectProps {
  onChange: (fieldPath: string, value: any) => void;
  projectAttrs: IUpdatedProjectProperties;
}

const ProjectFolderSelect = memo<
  InjectedLocalized & InjectedIntlProps & IProjectFolderSelectProps
>(
  ({
    projectAttrs,
    onChange,
    localize,
    intl: { formatMessage },
  }): ReactElement => {
    const { projectFolders } = useProjectFolders();
    const authUser = useAuthUser();

    const noFolderOption = {
      value: '',
      label: formatMessage(messages.noFolder),
    };

    const folderOptions = useMemo<IOption[]>(
      () =>
        projectFolders.map((folder) => ({
          value: isNilOrError(folder) ? '' : folder.id,
          label: localize(folder.attributes.title_multiloc),
        })),
      [projectFolders]
    );

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
      ({ value }) => {
        onChange('projectAttributesDiff.folder_id', value);
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

export default localize<IProjectFolderSelectProps>(
  injectIntl(ProjectFolderSelect)
);
