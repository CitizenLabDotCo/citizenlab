import React, { ReactElement, useMemo, memo, useCallback } from 'react';

// services
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

// hooks
import { useProjectFolders } from 'modules/project_folders/hooks';

// components
import { Select } from 'cl2-component-library';

// utils
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';

interface Props {
  value: string;
  onChange: (value: IOption) => void;
  Wrapper?: (props: any) => ReactElement;
  Title?: ReactElement;
}

const ProjectFolderSelect = memo<Props & InjectedLocalized>(
  ({ value, onChange, Wrapper, Title, localize }): ReactElement => {
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

    const SelectTag = useMemo(
      () => (
        <Select value={value} options={folderOptions} onChange={handleChange} />
      ),
      [value, folderOptions, handleChange]
    );

    if (Wrapper && Title) {
      return (
        <Wrapper>
          {Title}
          {SelectTag}
        </Wrapper>
      );
    }
    return SelectTag;
  }
);

export default localize(ProjectFolderSelect);
