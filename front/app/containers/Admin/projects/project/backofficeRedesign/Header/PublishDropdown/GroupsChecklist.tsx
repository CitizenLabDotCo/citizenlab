import React from 'react';

import useGroups from 'api/groups/useGroups';
import useAddProjectGroup from 'api/project_groups/useAddProjectGroup';
import useDeleteProjectGroup from 'api/project_groups/useDeleteProjectGroup';
import useProjectGroups from 'api/project_groups/useProjectGroups';

import useLocalize from 'hooks/useLocalize';

import Banner from 'design-system/Banner';
import Checkbox from 'design-system/Checkbox';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './PublishDropdown.module.css';

interface Props {
  projectId: string;
}

const GroupsChecklist = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: groups } = useGroups({});
  const { data: projectGroups, isFetching } = useProjectGroups({ projectId });
  const {
    mutate: addProjectGroup,
    isPending: adding,
    isError: addFailed,
  } = useAddProjectGroup();
  const {
    mutate: deleteProjectGroup,
    isPending: deleting,
    isError: deleteFailed,
  } = useDeleteProjectGroup({ projectId });

  if (!groups || !projectGroups) return null;

  const linkIds = new Map(
    projectGroups.data.map((link) => [
      link.relationships.group.data.id,
      link.id,
    ])
  );

  // Toggling decides between adding and removing from the list, so it waits
  // until the list has caught up with the last change.
  const busy = adding || deleting || isFetching;

  const toggle = (groupId: string) => {
    const linkId = linkIds.get(groupId);

    if (linkId) {
      deleteProjectGroup(linkId);
    } else {
      addProjectGroup({ groupId, projectId });
    }
  };

  return (
    <div className={styles.groups}>
      <p className={styles.groupsIntro}>
        {formatMessage(
          groups.data.length > 0
            ? messages.publishChooseGroups
            : messages.publishNoGroups
        )}
      </p>
      {groups.data.map((group) => (
        <div key={group.id} className={styles.groupOption}>
          <Checkbox
            isSelected={linkIds.has(group.id)}
            isDisabled={busy}
            onChange={() => toggle(group.id)}
          >
            {localize(group.attributes.title_multiloc)}
          </Checkbox>
        </div>
      ))}
      {(addFailed || deleteFailed) && (
        <Banner tone="error">
          {formatMessage(messages.publishGroupsSaveFailed)}
        </Banner>
      )}
    </div>
  );
};

export default GroupsChecklist;
