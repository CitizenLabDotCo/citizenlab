import React, { useState } from 'react';
import { adopt } from 'react-adopt';

// components
import FilterSelector from 'components/FilterSelector';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import injectLocalize from 'utils/localize';
import useLocalize from 'hooks/useLocalize';
import { useSearchParams } from 'react-router-dom';

type DataProps = {
  projects: GetProjectsChildProps;
};

type InputProps = {
  title: string | JSX.Element;
  onChange: (projectIds: string[]) => void;
  className?: string;
  textColor?: string;
  filterSelectorStyle?: 'button' | 'text';
  listTop?: string;
  mobileLeft?: string;
  eventsTime?: 'past' | 'currentAndFuture';
};

type Props = InputProps & DataProps;

const ProjectFilterDropdown = ({
  onChange,
  projects,
  title,
  className,
  textColor,
  filterSelectorStyle,
  listTop,
  mobileLeft,
  eventsTime,
}: Props) => {
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

  if (projects && projects.length > 0) {
    const options = projects.map((project) => {
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

const Data = adopt<DataProps, InputProps>({
  projects: <GetProjects publicationStatuses={['published']} sort="new" />,
});

const ProjectFilterDropdownWithLocalize = injectLocalize(ProjectFilterDropdown);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectFilterDropdownWithLocalize {...dataProps} {...inputProps} />
    )}
  </Data>
);
