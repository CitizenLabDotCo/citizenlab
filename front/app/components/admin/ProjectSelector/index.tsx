import React from 'react';

import { PublicationStatus } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import FilterSelector from 'components/FilterSelector';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  title: string;
  onChange: (projectIds: string[]) => void;
  selectedProjectIds: string[];
}

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

const ProjectSelector = ({ onChange, selectedProjectIds, title }: Props) => {
  const localize = useLocalize();
  const { data: projects } = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
  });

  const handleOnChange = (newProjectIds: string[]) => {
    onChange(newProjectIds);
  };

  if (!isNilOrError(projects) && projects.data.length > 0) {
    const values = projects.data.map((project) => {
      return {
        text: localize(project.attributes.title_multiloc),
        value: project.id,
      };
    });

    return (
      <FilterSelector
        title={title}
        name="building"
        selected={selectedProjectIds}
        values={values}
        onChange={handleOnChange}
        multipleSelectionAllowed={true}
      />
    );
  }

  return null;
};

export default ProjectSelector;
