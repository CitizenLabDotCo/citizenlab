import React, { useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import FilterSelector from 'components/FilterSelector';

import { classNames } from 'utils/helperUtils';

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    projectIdsFromUrl || []
  );
  const localize = useLocalize();

  const handleOnChange = (selectedValues: string[]) => {
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

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (options && options.length > 0) {
      return (
        <FilterSelector
          className={classNames(className, 'e2e-project-filter-selector')}
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
