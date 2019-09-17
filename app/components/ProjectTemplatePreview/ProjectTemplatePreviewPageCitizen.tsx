import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ProjectTemplatePreview from './ProjectTemplatePreview';

// styling
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  justify-content: center;
  padding-top: 50px;
  padding-bottom: 50px;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

export interface Props {
  projectTemplateId: string;
  className?: string;
}

const ProjectTemplatePreviewPageCitizen = memo<Props & WithRouterProps>(({ params, className }) => {
  if (params && params['projectTemplateId']) {
    return (
      <Container className={className || ''}>
        <ProjectTemplatePreview projectTemplateId={params['projectTemplateId']} />
      </Container>
    );
  }

  return null;
});

export default withRouter(ProjectTemplatePreviewPageCitizen);
