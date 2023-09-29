import React from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';
import { useLocation } from 'react-router-dom';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';

// routing
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const Container = styled.div`
  flex: 0 0 ${(props) => props.theme.mobileTopBarHeight}px;
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background-color: #fff;
  border-bottom: solid 1px ${colors.coolGrey300};
  position: sticky;
  top: 0;
  z-index: 2000;
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
  const location = useLocation();

  return (
    <Container>
      <TopBarInner>
        <Box height="48px" alignItems="center" display="flex">
          <GoBackButtonSolid
            text={formatMessage(messages.goBack)}
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={() => {
              const hasGoBackLink = location.key !== 'default';
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
