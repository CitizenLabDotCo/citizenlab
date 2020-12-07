import React, { ReactElement, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';

// services
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';

// components
import { Select, IconTooltip } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

// utils
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';

import messages from './messages';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

interface Props {
  onChange: (value: string) => void;
  value: string | null;
}

const ProjectFolderSelect = memo<Props & InjectedLocalized>(
  ({ value, onChange, localize }): ReactElement => {
    const { projectFolders } = useProjectFolders({});

    const hasAdminPublication = (folder: IProjectFolderData): boolean =>
      !isNilOrError(folder.relationships.admin_publication?.data);

    const folderOptions = useMemo<IOption[]>(
      () =>
        projectFolders.filter(hasAdminPublication).map((folder) => ({
          value: isNilOrError(folder.relationships.admin_publication.data)
            ? ''
            : folder.relationships.admin_publication.data.id,
          label: localize(folder.attributes.title_multiloc),
        })),
      [projectFolders]
    );

    const handleChange = useCallback(
      ({ value }) => {
        onChange(value);
      },
      [onChange]
    );

    return (
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.folder} />
          <IconTooltip
            content={<FormattedMessage {...messages.folderTooltip} />}
          />
        </SubSectionTitle>
        <Select value={value} options={folderOptions} onChange={handleChange} />
      </StyledSectionField>
    );
  }
);

export default localize(ProjectFolderSelect);
