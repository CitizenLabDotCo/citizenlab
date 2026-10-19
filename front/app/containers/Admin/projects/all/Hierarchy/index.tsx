import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { HEADER_BAR_INSET } from '../../_shared/components/HeaderBar';

import DragPreview from './Arrange/DragPreview';
import { PAGE_SIDE_PADDING } from './constants';
import CurrentLevel from './CurrentLevel';
import LevelError from './LevelError';
import PageHeader from './PageHeader';
import ToastProvider from './Toast/ToastProvider';
import useRootContents from './useRootContents';

// The projects page as a hierarchy: spaces, then folders, then projects.
const ProjectsHierarchy = () => {
  const rootContents = useRootContents();
  const { landing, isError } = rootContents;

  // The header bar runs across the top, as on the project pages, so New sits
  // where their main button does. Below it, the levels take the page's full
  // width; the old page keeps its own frame, capped and centred, while both
  // exist behind the flag.
  return (
    // Items are arranged by dragging them within their group.
    <DndProvider backend={HTML5Backend}>
      <DragPreview />
      <ToastProvider>
        <Box
          bgColor={colors.white}
          w="100%"
          minHeight="100vh"
          pb="45px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box w="100%" p={HEADER_BAR_INSET}>
            <PageHeader />
          </Box>
          <Box px={PAGE_SIDE_PADDING} w="100%">
            {isError && <LevelError />}
            {landing && (
              <CurrentLevel landing={landing} contents={rootContents} />
            )}
          </Box>
        </Box>
      </ToastProvider>
    </DndProvider>
  );
};

export default ProjectsHierarchy;
