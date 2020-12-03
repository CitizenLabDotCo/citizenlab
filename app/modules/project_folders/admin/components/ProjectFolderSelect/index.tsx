import React, { ReactElement, useMemo, memo, useCallback } from 'react';
import merge from 'deepmerge';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';

// services
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';

// components
import { Select } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { IconTooltip } from 'cl2-component-library';

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

interface Props {
  value: string;
  setState: (prevState?: object) => object;
  project: IUpdatedProjectProperties;
}

const ProjectFolderSelect = memo<Props & InjectedLocalized>(
  ({ project, setState, localize }): ReactElement => {
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
        setState((prevState) =>
          merge(prevState, {
            projectAttributesDiff: {
              admin_publication_attributes: { parent_id: value },
            },
          })
        );
      },
      [setState]
    );

    if (!isNilOrError(project.admin_publication_attributes)) {
      return (
        <StyledSectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.folder} />
            <IconTooltip
              content={<FormattedMessage {...messages.folderTooltip} />}
            />
            <Select
              value={project.admin_publication_attributes.parent_id}
              options={folderOptions}
              onChange={handleChange}
            />
          </SubSectionTitle>
        </StyledSectionField>
      );
    }

    return <></>;
  }
);

export default localize(ProjectFolderSelect);
