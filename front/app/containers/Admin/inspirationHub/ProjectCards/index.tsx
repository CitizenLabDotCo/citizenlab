import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';
import useInfiniteProjectLibraryProjects from 'api/project_library_projects/useInfiniteProjectLibraryProjects';

import ProjectCard from '../components/ProjectCard';
import { useRansackParams } from '../utils';

const Item = styled.div<{ start: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${(props) => props.start}px);
`;

const ProjectCards = () => {
  const ransackParams = useRansackParams();
  const { data: projects, hasNextPage } = useInfiniteProjectLibraryProjects({
    ...ransackParams,
    'page[size]': 40, // TODO remove
  });

  const flatProjects = useMemo(() => {
    if (!projects) return undefined;
    return projects.pages.map((page) => page.data).flat();
  }, [projects]);

  const projectsInRows = useMemo(() => {
    if (!flatProjects) return [];

    const rows: ProjectLibraryProjectData[][] = [];

    flatProjects.forEach((project, index) => {
      if (index % 3 === 0) {
        rows.push([project]);
      } else {
        rows[rows.length - 1].push(project);
      }
    });

    return rows;
  }, [flatProjects]);

  const rowsLength = projectsInRows.length;

  const { getVirtualItems, measureElement, getTotalSize } = useVirtualizer({
    count: hasNextPage ? rowsLength + 1 : rowsLength,
    getScrollElement: () => document.getElementById('inspiration-hub'),
    estimateSize: () => 4,
    overscan: 1,
  });

  const virtualItems = getVirtualItems();
  const totalSize = getTotalSize();

  return (
    <Box position="relative" height={`${totalSize}px`} width="100%">
      {virtualItems.map((virtualRow) => {
        const row = projectsInRows[virtualRow.index];
        if (!row as any) return null;

        return (
          <Item
            key={virtualRow.index}
            start={virtualRow.start}
            data-index={virtualRow.index}
            ref={measureElement}
          >
            <Box display="flex" flexDirection="row" gap="12px" mt="12px">
              {row.map((project) => (
                <ProjectCard project={project} key={project.id} />
              ))}
            </Box>
          </Item>
        );
      })}
    </Box>
  );
};

export default ProjectCards;
