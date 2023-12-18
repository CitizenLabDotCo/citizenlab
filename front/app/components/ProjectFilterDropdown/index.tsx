import React, { useState } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useSearchParams } from 'react-router-dom';
import useProjects from 'api/projects/useProjects';

type Props = {
  title: string | JSX.Element;
  onChange: (projectIds: string[]) => void;
  className?: string;
  textColor?: string;
  filterSelectorStyle?: 'button' | 'text';
  listTop?: string;
  mobileLeft?: string;
  eventsTime?: 'past' | 'currentAndFuture';
};

const ProjectFilterDropdown = ({
  onChange,
  title,
  className,
  textColor,
  filterSelectorStyle,
  listTop,
  mobileLeft,
  eventsTime,
}: Props) => {
  const { data: projects } = useProjects({
    publicationStatuses: ['published'],
    sort: 'new',
  });
  const [searchParams] = useSearchParams();
  const projectIdsParam =
    eventsTime === 'past'
      ? searchParams.get('past_events_project_ids')
      : searchParams.get('ongoing_events_project_ids');

  const projectIdsFromUrl: string[] = projectIdsParam
    ? JSON.parse(projectIdsParam)
    : null;

  const [selectedValues, setSelectedValues] = useState<string[]>(
    projectIdsFromUrl || []
  );
  const localize = useLocalize();

  const handleOnChange = (selectedValues) => {
    setSelectedValues(selectedValues);
    onChange(selectedValues);
  };

  if (projects && projects.data.length > 0) {
    const options = projects.data.map((project) => {
      return {
        text: localize(project.attributes.title_multiloc),
        value: project.id,
      };
    });

    if (options && options.length > 0) {
      return (
        <FilterSelector
          id="e2e-project-filter-selector"
          className={className}
          title={title}
          name="projects"
          selected={selectedValues}
          values={options}
          onChange={handleOnChange}
          multipleSelectionAllowed={true}
          right="-10px"
          mobileLeft={mobileLeft ? mobileLeft : '0px'}
          textColor={textColor}
          filterSelectorStyle={filterSelectorStyle}
          top={listTop}
        />
      );
    }
  }

  return null;
};

export default ProjectFilterDropdown;
