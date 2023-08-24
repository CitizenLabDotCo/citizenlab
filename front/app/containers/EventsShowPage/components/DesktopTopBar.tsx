import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

// router
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { useLocation } from 'react-router-dom';

// intl
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
}

const TopBar = ({ project }: Props) => {
  const location = useLocation();
  const { formatMessage } = useIntl();

  return (
    <Bar>
      <Box mb="40px">
        <GoBackButtonSolid
          text={formatMessage(messages.goBack)}
          onClick={() => {
            const hasGoBackLink = location.key !== 'default';
            hasGoBackLink
              ? clHistory.goBack()
              : clHistory.push(`/projects/${project.attributes.slug}`);
          }}
        />
      </Box>
    </Bar>
  );
};

export default TopBar;
