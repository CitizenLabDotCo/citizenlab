import React, { memo, useEffect, useState } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useInputTopicById from 'api/input_topics/useInputTopicById';
import useInputTopics from 'api/input_topics/useInputTopics';
import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const TopicValueSelector = memo(({ value, onChange }: Props) => {
  const localize = useLocalize();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Look up the topic to get its project when we have an existing value
  const { data: existingTopic } = useInputTopicById(value);

  // Get all projects
  const { data: projectsResponse } = useProjects({
    publicationStatuses: ['draft', 'published', 'archived'],
  });

  // Get topics for the selected project
  const { data: topicsResponse } = useInputTopics(selectedProjectId);

  // When we load an existing value, set the project from the topic
  useEffect(() => {
    if (existingTopic && !selectedProjectId) {
      const projectId = existingTopic.data.relationships.project.data.id;
      setSelectedProjectId(projectId);
    }
  }, [existingTopic, selectedProjectId]);

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
    // Clear the topic value when project changes
    onChange('');
  };

  const handleTopicChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Select
        value={selectedProjectId}
        options={generateProjectOptions()}
        onChange={handleProjectChange}
        placeholder="Select project..."
      />
      <Select
        value={value}
        options={generateTopicOptions()}
        onChange={handleTopicChange}
        disabled={!selectedProjectId}
        placeholder="Select topic..."
      />
    </Box>
  );
});

export default TopicValueSelector;
