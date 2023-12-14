import React, { useState, useCallback, useEffect } from 'react';

// components
import { Box, isRtl } from '@citizenlab/cl2-component-library';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import IdeaMoreActions from './IdeaMoreActions';

// router
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';

// typings
import { IProjectData } from 'api/projects/types';
import { IIdeaData } from 'api/ideas/types';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

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
  const [searchParams] = useSearchParams();
  const goBackParameter = searchParams.get('go_back');
  const [goBack] = useState(goBackParameter === 'true');
  const { formatMessage } = useIntl();

  useEffect(() => {
    removeSearchParams(['go_back']);
  }, []);

  const handleGoBack = useCallback(() => {
    if (goBack) {
      clHistory.back();
    } else if (project) {
      clHistory.push(`/projects/${project.attributes.slug}`);
    } else {
      clHistory.push('/');
    }
  }, [goBack, project]);

  return (
    <Bar>
      <Box mb="40px">
        <GoBackButtonSolid
          text={formatMessage(messages.goBack)}
          onClick={handleGoBack}
        />
      </Box>

      <IdeaMoreActions idea={idea} projectId={project.id} />
    </Bar>
  );
};

export default TopBar;
