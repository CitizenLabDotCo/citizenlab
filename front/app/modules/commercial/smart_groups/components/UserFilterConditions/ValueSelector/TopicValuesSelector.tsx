import React, { memo, useEffect, useState } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useInputTopics from 'api/input_topics/useInputTopics';
import useInputTopicsById from 'api/input_topics/useInputTopicsById';
import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

export interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const TopicValuesSelector = memo(({ value, onChange }: Props) => {
  const localize = useLocalize();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Look up the topics to get their project when we have existing values
  const { data: existingTopics } = useInputTopicsById(value);

  // Get all projects
  const { data: projectsResponse } = useProjects({
    publicationStatuses: ['draft', 'published', 'archived'],
  });

  // Get topics for the selected project
  const { data: topicsResponse } = useInputTopics(selectedProjectId);

  // When we load existing values, set the project from the first topic
  // (all topics should be from the same project)
  useEffect(() => {
    if (existingTopics.length > 0 && !selectedProjectId) {
      const projectId = existingTopics[0].data.relationships.project.data.id;
      setSelectedProjectId(projectId);
    }
  }, [existingTopics, selectedProjectId]);

  const generateProjectOptions = (): IOption[] => {
    if (!projectsResponse?.data) return [];
    return projectsResponse.data.map((project) => ({
      value: project.id,
      label: localize(project.attributes.title_multiloc),
    }));
  };

  const generateTopicOptions = (): IOption[] => {
    if (!topicsResponse?.data) return [];
    return topicsResponse.data.map((topic) => ({
      value: topic.id,
      label: localize(topic.attributes.full_title_multiloc),
    }));
  };

  const handleProjectChange = (option: IOption) => {
    setSelectedProjectId(option.value);
    // Clear the topic values when project changes
    onChange([]);
  };

  const handleTopicsChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Select
        value={selectedProjectId}
        options={generateProjectOptions()}
        onChange={handleProjectChange}
        placeholder="Select project..."
      />
      <MultipleSelect
        value={value}
        options={generateTopicOptions()}
        onChange={handleTopicsChange}
        disabled={!selectedProjectId}
        placeholder="Select topics..."
      />
    </Box>
  );
});

export default TopicValuesSelector;
