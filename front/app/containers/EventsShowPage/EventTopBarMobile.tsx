import React, { useCallback } from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// routing
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  flex: 0 0 ${(props) => props.theme.mobileTopBarHeight}px;
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background-color: #fff;
  border-bottom: solid 1px ${lighten(0.3, colors.textSecondary)};
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

const Left = styled.div`
  height: 48px;
  align-items: center;
  display: flex;
`;

const Right = styled.div``;

interface Props {
  projectId?: string;
}

const EventTopBarMobile = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const isSmallerThanTablet = useBreakpoint('tablet');

  const localize = useLocalize();

  const handleGoBack = useCallback(() => {
    if (project) {
      clHistory.push(`/projects/${project.data.attributes.slug}`);
    } else {
      clHistory.push('/');
    }
  }, [project]);

  return (
    <Container>
      <TopBarInner>
        <Left>
          <GoBackButtonSolid
            text={
              project ? localize(project.data.attributes.title_multiloc) : ''
            }
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={handleGoBack}
          />
        </Left>
        <Right />
      </TopBarInner>
    </Container>
  );
};

export default EventTopBarMobile;
