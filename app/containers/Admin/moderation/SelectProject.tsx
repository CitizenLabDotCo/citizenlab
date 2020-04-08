import React, { memo, useState, useCallback } from 'react';
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const SelectProject = memo(() => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const handleOnChange = useCallback((selectedProjects: string[]) => {
    setSelectedProjects((selectedProjects || []));
  }, []);

  return (
    <FilterSelector
      title={'Project'}
      name="project"
      selected={selectedProjects}
      values={[{
        text: 'Project 1',
        value: 'project-1'
      },
      {
        text: 'Project 2',
        value: 'project-2'
      },
      {
        text: 'Project 3',
        value: 'project-3'
      }]}
      onChange={handleOnChange}
      multipleSelectionAllowed={true}
    />
  );
});

export default SelectProject;
