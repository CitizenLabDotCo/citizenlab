import React, { ReactElement, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

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

const ProjectFolderSelect = memo<Props & InjectedLocalized & InjectedIntlProps>(
  ({ value, onChange, localize, intl: { formatMessage } }): ReactElement => {
    const { projectFolders } = useProjectFolders();

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

    const allOptions = useMemo<IOption[]>(
      () => [noFolderOption, ...folderOptions],
      [folderOptions, noFolderOption]
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
        <Select value={value} options={allOptions} onChange={handleChange} />
      </StyledSectionField>
    );
  }
);

export default localize(injectIntl(ProjectFolderSelect));
