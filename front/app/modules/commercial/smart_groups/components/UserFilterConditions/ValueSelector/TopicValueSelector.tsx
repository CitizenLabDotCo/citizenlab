import React, { memo, useEffect, useState } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { IOption } from 'typings';

import useInputTopicById from 'api/input_topics/useInputTopicById';
import useInputTopics from 'api/input_topics/useInputTopics';

import useLocalize from 'hooks/useLocalize';

import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

interface InnerProps extends Props {
  projects: GetProjectsChildProps;
}

const TopicValueSelectorInner = memo(
  ({ value, onChange, projects }: InnerProps) => {
    const localize = useLocalize();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    // Look up the topic to get its project when we have an existing value
    const { data: existingTopic } = useInputTopicById(value);

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
      if (isNilOrError(projects)) return [];
      return projects.map((project) => ({
        value: project.id,
        label: localize(project.attributes.title_multiloc),
      }));
    };

    const generateTopicOptions = (): IOption[] => {
      if (!topicsResponse?.data) return [];
      return topicsResponse.data.map((topic) => ({
        value: topic.id,
        label: localize(topic.attributes.title_multiloc),
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
  }
);

const TopicValueSelector = (props: Props) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {(projects) => <TopicValueSelectorInner {...props} projects={projects} />}
  </GetProjects>
);

export default TopicValueSelector;
