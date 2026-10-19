import React from 'react';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import EmptyLevel from './EmptyLevel';
import { LevelGroup } from './levelGroups';
import LevelView from './LevelView';
import { getRootLabels } from './rootLabels';
import useProjectSort from './useProjectSort';
import { RootContents } from './useRootContents';

interface Props {
  contents: RootContents;
}

const RootLevel = ({ contents }: Props) => {
  const { formatMessage } = useIntl();
  const seesAll = usePermission({
    item: 'project',
    action: 'list_all_for_admin',
  });
  const sort = useProjectSort();

  const { spaces } = contents;
  const spacesCount = spaces?.data.length ?? 0;
  const foldersCount = contents.folders.data?.pages[0].meta.total ?? 0;
  const projectsCount = contents.projects.data?.pages[0].meta.total ?? 0;

  if (spacesCount + foldersCount + projectsCount === 0) {
    return <EmptyLevel />;
  }

  const labels = getRootLabels({
    seesAll,
    hasContainers: spacesCount + foldersCount > 0,
  });

  const groups: LevelGroup[] = [];
  if (spaces && spacesCount > 0) {
    groups.push({
      kind: 'spaces',
      label: formatMessage(labels.spaces, { count: spacesCount }),
      count: spacesCount,
      arrangeable: true,
      spaces,
    });
  }
  if (foldersCount > 0) {
    groups.push({
      kind: 'folders',
      label: formatMessage(labels.folders),
      count: foldersCount,
      arrangeable: true,
      query: contents.folders,
    });
  }
  if (projectsCount > 0) {
    groups.push({
      kind: 'projects',
      label: formatMessage(labels.projects),
      count: projectsCount,
      // Everyone else's top projects can sit in any folder or space.
      arrangeable: seesAll && sort === 'arranged',
      query: contents.projects,
      pathFrom: 'root',
    });
  }

  return <LevelView groups={groups} />;
};

export default RootLevel;
