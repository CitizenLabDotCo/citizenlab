import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import CurrentLevel from './CurrentLevel';
import LevelError from './LevelError';
import PageHeader from './PageHeader';
import ToastProvider from './Toast/ToastProvider';
import useRootContents from './useRootContents';

// The projects page as a hierarchy: spaces, then folders, then projects.
const ProjectsHierarchy = () => {
  const rootContents = useRootContents();
  const { landing, isError } = rootContents;

  // The same frame as the old page, kept apart so the old page stays as it is
  // while both exist behind the flag.
  return (
    <ToastProvider>
      <Box
        bgColor={colors.white}
        w="100%"
        minHeight="100vh"
        py="45px"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box px="51px" maxWidth="1400px" w="100%">
          <PageHeader />
          {isError && <LevelError />}
          {landing && (
            <CurrentLevel landing={landing} contents={rootContents} />
          )}
        </Box>
      </Box>
    </ToastProvider>
  );
};

export default ProjectsHierarchy;
