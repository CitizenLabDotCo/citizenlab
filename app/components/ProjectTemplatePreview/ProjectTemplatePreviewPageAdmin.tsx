import React, { memo, useCallback } from 'react';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import ProjectTemplatePreview from './ProjectTemplatePreview';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  margin-bottom: 50px;
`;

const AdminHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-left: -20px;
`;

export interface Props {
  projectTemplateId: string;
  goBack?: () => void;
  useTemplate?: () => void;
  className?: string;
}

const ProjectTemplatePreviewPageAdmin = memo<Props & WithRouterProps>(({ params, projectTemplateId, goBack, useTemplate, className }) => {

  const templateId: string | undefined = (projectTemplateId || get(params, 'projectTemplateId'));

  const onGoBack = useCallback(() => {
    goBack ? goBack() : clHistory.push('/admin/projects');
  }, []);

  const onUseTemplate = useCallback(() => {
    useTemplate ? useTemplate() : clHistory.push(`admin/projects/all?use_templateId=${templateId}`);
  }, []);

  if (templateId) {
    return (
      <Container className={className || ''}>
        <AdminHeader>
          {goBack
            ? <Button style="text" icon="arrow-back" onClick={onGoBack}><FormattedMessage {...messages.goBack} /></Button>
            : <Button style="text" icon="list" onClick={onGoBack}><FormattedMessage {...messages.seeMoreTemplates} /></Button>
          }
          <Button onClick={onUseTemplate}>Use template</Button>
        </AdminHeader>
        <ProjectTemplatePreview projectTemplateId={templateId} />
      </Container>
    );
  }

  return null;
});

export default withRouter(ProjectTemplatePreviewPageAdmin);
