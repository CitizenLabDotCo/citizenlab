import React, { memo, useCallback, useState } from 'react';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import ProjectTemplatePreview from './ProjectTemplatePreview';
import UseTemplateModal from 'components/ProjectTemplatePreview/UseTemplateModal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  margin-bottom: 60px;
`;

const AdminHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  margin-left: -20px;
`;

export interface Props {
  projectTemplateId: string;
  goBack?: () => void;
  useTemplate?: () => void;
  className?: string;
}

const ProjectTemplatePreviewPageAdmin = memo<Props & WithRouterProps>(({ params, projectTemplateId, goBack, className }) => {

  const templateId: string | undefined = (projectTemplateId || get(params, 'projectTemplateId'));

  const [modalOpened, setModalOpened] = useState<boolean>(false);

  const onOpenModal = useCallback(() => {
    setModalOpened(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setModalOpened(false);
  }, []);

  const onGoBack = useCallback(() => {
    goBack ? goBack() : clHistory.push('/admin/projects');
  }, []);

  if (templateId) {
    return (
      <Container className={className || ''}>
        <AdminHeader>
          {goBack
            ? <Button style="text" icon="arrow-back" onClick={onGoBack}><FormattedMessage {...messages.goBack} /></Button>
            : <Button style="text" icon="list" onClick={onGoBack}><FormattedMessage {...messages.seeMoreTemplates} /></Button>
          }
          <Button onClick={onOpenModal} style="admin-dark"><FormattedMessage {...messages.useTemplate} /></Button>
        </AdminHeader>

        <ProjectTemplatePreview projectTemplateId={templateId} />

        <UseTemplateModal
          projectTemplateId={projectTemplateId}
          opened={modalOpened}
          emitSuccessEvent={true}
          showGoBackLink={true}
          close={onCloseModal}
        />
      </Container>
    );
  }

  return null;
});

export default withRouter(ProjectTemplatePreviewPageAdmin);
