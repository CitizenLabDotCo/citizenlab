import React from 'react';

import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

interface Props {
  projectId: string;
}

const ProjectSelect = ({ projectId }: Props) => {
  const { data: projects } = useProjects({
    pageNumber: 1,
    pageSize: 500,
    publicationStatuses: ['published', 'archived'],
  });
  const localize = useLocalize();

  if (!projects) return null;

  const options = projects.data.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  return (
    <MultipleSelect
      value={projectId}
      options={options}
      onChange={(options) => {
        console.log(options);
      }}
    />
  );
};

export default ProjectSelect;
