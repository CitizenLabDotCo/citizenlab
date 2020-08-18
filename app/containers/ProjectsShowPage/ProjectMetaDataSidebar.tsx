import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  padding: 0;
  padding-top: 12px;
`;

const Content = styled.div`
  border-top: solid 1px ${colors.separation};
  border-bottom: solid px ${colors.separation};
`;

const ProjectMetaDataSidebar = memo(
  ({ projectId, className }: { projectId: string; className?: string }) => {
    const project = useProject({ projectId });
    const phases = usePhases(projectId);

    console.log(project);
    console.log(phases);

    if (!isNilOrError(project)) {
      return (
        <Container className={className || ''}>
          <Title>
            <FormattedMessage {...messages.aboutThisProject} />
          </Title>
          <Content>
            Content
          </Content>
        </Container>
      );
    }

    return null;
  }
);

export default ProjectMetaDataSidebar;
