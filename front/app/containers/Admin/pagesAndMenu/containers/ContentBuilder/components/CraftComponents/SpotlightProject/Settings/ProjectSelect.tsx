import React, { KeyboardEvent } from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { IOption } from 'typings';

import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  projectId: string;
  onSelect: (projectId: string) => void;
}

const ProjectSelect = ({ projectId, onSelect }: Props) => {
  const { data: projects } = useProjects({
    pageNumber: 1,
    pageSize: 500,
    publicationStatuses: ['published', 'archived'],
  });
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!projects) return null;

  const options: IOption[] = projects.data.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  const selectedOption = options.find((option) => option.value === projectId);

  const handleChange = (value: IOption) => {
    onSelect(value.value);
  };

  return (
    <Box>
      <Label htmlFor="project-select">
        {formatMessage(messages.selectProject)}
      </Label>
      <ReactSelect
        inputId="project-select"
        isSearchable={true}
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable={false}
        value={selectedOption}
        placeholder=""
        options={options}
        styles={selectStyles()}
        menuPosition="fixed"
        menuPlacement="auto"
        hideSelectedOptions
        onKeyDown={preventModalCloseOnEscape}
        onChange={handleChange}
      />
    </Box>
  );
};

const preventModalCloseOnEscape = (event: KeyboardEvent) => {
  if (event.code === 'Escape') event.stopPropagation();
};

export default ProjectSelect;
