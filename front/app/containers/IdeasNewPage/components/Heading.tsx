import React, { useCallback } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

import clHistory from 'utils/cl-router/history';

type Props = {
  project: IProjectData;
  titleText: string | React.ReactNode;
};

export const Heading = ({ project, titleText }: Props) => {
  const localize = useLocalize();

  const goBackToProject = useCallback(() => {
    clHistory.push(`/projects/${project.attributes.slug}`);
  }, [project]);

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      pt="40px"
      zIndex="3"
    >
      <Box w="100%">
        <GoBackButtonSolid
          text={localize(project.attributes.title_multiloc)}
          onClick={goBackToProject}
        />
      </Box>

      <Box width="100%">
        <Text
          width="100%"
          color={'tenantPrimary'}
          variant="bodyL"
          style={{ fontWeight: 500 }}
          fontSize={'xxxxl'}
          ml={'0px'}
          my={'8px'}
        >
          {titleText}
        </Text>
      </Box>
    </Box>
  );
};
