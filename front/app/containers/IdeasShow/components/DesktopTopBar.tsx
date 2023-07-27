import React, { useCallback } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import IdeaMoreActions from './IdeaMoreActions';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IIdeaData } from 'api/ideas/types';

const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

interface Props {
  project: IProjectData;
  idea: IIdeaData;
}

const TopBar = ({ project, idea }: Props) => {
  const localize = useLocalize();

  const handleGoBack = useCallback(() => {
    if (project) {
      clHistory.push(`/projects/${project.attributes.slug}`);
    } else {
      clHistory.push('/');
    }
  }, [project]);

  return (
    <Bar>
      <Box mb="40px">
        <GoBackButtonSolid
          text={localize(project.attributes.title_multiloc)}
          onClick={handleGoBack}
        />
      </Box>

      <IdeaMoreActions idea={idea} projectId={project.id} />
    </Bar>
  );
};

export default TopBar;
