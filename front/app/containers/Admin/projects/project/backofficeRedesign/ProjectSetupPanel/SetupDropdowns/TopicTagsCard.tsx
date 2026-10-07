import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import TopicInputs from 'containers/Admin/projects/_shared/components/ProjectSetupForm/TopicInputs';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  project: IProjectData;
}

const TopicTagsCard = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject } = useUpdateProject();
  // Each click saves the whole list, so quick clicks must build on the
  // previous pick rather than on project data that hasn't refetched yet.
  const [pickedTopicIds, setPickedTopicIds] = useState<string[]>();

  const topicIds =
    pickedTopicIds ??
    project.relationships.global_topics.data.map((topic) => topic.id);

  const handleChange = (global_topic_ids: string[]) => {
    setPickedTopicIds(global_topic_ids);
    updateProject(
      { projectId: project.id, global_topic_ids },
      { onError: () => setPickedTopicIds(undefined) }
    );
  };

  return (
    <PanelGroup label={formatMessage(messages.topicTags)}>
      <TopicInputs selectedTopicIds={topicIds} onChange={handleChange} />
    </PanelGroup>
  );
};

export default TopicTagsCard;
