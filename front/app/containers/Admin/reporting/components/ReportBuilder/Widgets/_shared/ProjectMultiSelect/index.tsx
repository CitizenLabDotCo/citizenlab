import React, { useMemo } from 'react';

import { useProjects } from 'api/graph_data_units';
import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import useAutoCleanupMultiSelect from '../useAutoCleanupMultiSelect';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  publicationStatusFilter?: ProjectReportsPublicationStatus[];
  excludedFolderIds?: string[];
  placeholder?: string;
}

const ProjectMultiSelect = ({
  value,
  onChange,
  publicationStatusFilter,
  excludedFolderIds,
  placeholder,
}: Props) => {
  const localize = useLocalize();

  const { data: projectsData } = useProjects({
    publication_statuses: publicationStatusFilter || ['published'],
    excluded_folder_ids: excludedFolderIds,
  });

  const options = useMemo(() => {
    if (!projectsData) return [];

    return projectsData.data.attributes.projects.map((project) => ({
      value: project.id,
      label: localize(project.attributes.title_multiloc),
    }));
  }, [projectsData, localize]);

  const { selectedOptions, handleChange } = useAutoCleanupMultiSelect({
    value,
    options,
    onChange,
  });

  return (
    <MultipleSelect
      value={selectedOptions}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable={true}
    />
  );
};

export default ProjectMultiSelect;
