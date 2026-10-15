import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import EmptyLevel from './EmptyLevel';
import ItemLink from './ItemLink';
import { getRootLabels } from './rootLabels';
import Section from './Section';
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

  const spaces = contents.spaces.data?.data ?? [];
  const folders = contents.folders.data?.pages.flatMap((page) => page.data);
  const projects = contents.projects.data?.pages.flatMap((page) => page.data);
  const foldersCount = contents.folders.data?.pages[0].meta.total ?? 0;
  const projectsCount = contents.projects.data?.pages[0].meta.total ?? 0;

  if (spaces.length + foldersCount + projectsCount === 0) {
    return <EmptyLevel />;
  }

  const labels = getRootLabels({
    seesAll,
    hasContainers: spaces.length + foldersCount > 0,
  });

  return (
    <Box>
      {spaces.length > 0 && (
        <Section
          label={formatMessage(labels.spaces, { count: spaces.length })}
          count={spaces.length}
        >
          {spaces.map((space) => (
            <ItemLink
              key={space.id}
              titleMultiloc={space.attributes.title_multiloc}
              target={{ level: { kind: 'space', id: space.id } }}
            />
          ))}
        </Section>
      )}
      {folders && foldersCount > 0 && (
        <Section label={formatMessage(labels.folders)} count={foldersCount}>
          {folders.map((folder) => (
            <ItemLink
              key={folder.id}
              titleMultiloc={folder.attributes.title_multiloc}
              target={{ level: { kind: 'folder', id: folder.id } }}
            />
          ))}
        </Section>
      )}
      {projects && projectsCount > 0 && (
        <Section label={formatMessage(labels.projects)} count={projectsCount}>
          {projects.map((project) => (
            <ItemLink
              key={project.id}
              titleMultiloc={project.attributes.title_multiloc}
              target={{ projectId: project.id }}
            />
          ))}
        </Section>
      )}
    </Box>
  );
};

export default RootLevel;
