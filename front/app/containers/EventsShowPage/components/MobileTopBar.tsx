import React from 'react';

import { useBreakpoint, Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

const Container = styled.div`
  flex: 0 0 ${(props) => props.theme.mobileTopBarHeight}px;
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background-color: #fff;
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.desktop`
    padding-left: 30px;
    padding-right: 30px;
  `}
`;

interface Props {
  projectId?: string;
}

const MobileTopBar = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { formatMessage } = useIntl();

  return (
    <Container>
      <TopBarInner>
        <Box height="48px" alignItems="center" display="flex">
          <GoBackButtonSolid
            text={formatMessage(messages.goBack)}
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={() => {
              // Check if there's history to go back to
              const hasGoBackLink = window.history.length > 1;
              hasGoBackLink
                ? clHistory.goBack()
                : clHistory.push(`/projects/${project?.data.attributes.slug}`);
            }}
          />
        </Box>
      </TopBarInner>
    </Container>
  );
};

export default MobileTopBar;
