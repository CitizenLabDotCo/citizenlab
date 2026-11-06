import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import useGroups from 'api/groups/useGroups';
import useProjectGroups from 'api/project_groups/useProjectGroups';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { DraftProject } from '../../draft';
import messages from '../../messages';

// The settings of a project as text, for the saved project and its proposed version alike.
const useProjectLabels = (projectId: string) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: areas } = useAreas({});
  const { data: topics } = useGlobalTopics();
  const { data: groups } = useGroups({});
  const { data: projectGroups } = useProjectGroups({ projectId });

  const areaLabelsOf = (project: DraftProject) =>
    project.includeAllAreas
      ? [formatMessage(messages.allAreas)]
      : (areas?.data ?? [])
          .filter(({ id }) => project.areaIds.includes(id))
          .map(({ attributes }) => localize(attributes.title_multiloc));

  const topicLabelsOf = (project: DraftProject) =>
    (topics?.data ?? [])
      .filter(({ id }) => project.topicIds.includes(id))
      .map(({ attributes }) => localize(attributes.title_multiloc));

  const savedGroupIds = (projectGroups?.data ?? []).map(
    ({ relationships }) => relationships.group.data.id
  );

  const visibilityOf = (project: DraftProject) => {
    const groupIds = project.proposedGroupIds ?? savedGroupIds;
    const groupNames = (groups?.data ?? [])
      .filter(({ id }) => groupIds.includes(id))
      .map(({ attributes }) => localize(attributes.title_multiloc))
      .join(', ');

    return {
      public: formatMessage(messages.visibilityPublic),
      groups: formatMessage(messages.visibilityGroups, { groups: groupNames }),
      admins: formatMessage(messages.visibilityAdmins),
    }[project.visibleTo];
  };

  const listingOf = (project: DraftProject) =>
    formatMessage(project.listed ? messages.listed : messages.unlisted);

  return { areaLabelsOf, topicLabelsOf, visibilityOf, listingOf };
};

export default useProjectLabels;
