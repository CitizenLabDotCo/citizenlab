import { get } from 'lodash-es';
import React, { memo, useCallback, useEffect, useState } from 'react';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import Button from 'components/UI/Button';
import ProjectTemplatePreview from '../../components/ProjectTemplatePreview';
import UseTemplateModal from '../components/UseTemplateModal';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// analytics
import tracks from 'containers/Admin/projects/all/tracks';
import { trackEventByName } from 'utils/analytics';

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
  projectTemplateId?: string;
  goBack?: () => void;
  className?: string;
  onRender?: (hasRendered: boolean) => void;
}

const ProjectTemplatePreviewAdmin = memo<Props & WithRouterProps>(
  ({ params, projectTemplateId, goBack, className, onRender }) => {
    const templateId: string | undefined =
      projectTemplateId || get(params, 'projectTemplateId');

    const [modalOpened, setModalOpened] = useState<boolean>(false);

    const onOpenModal = useCallback(() => {
      trackEventByName(tracks.useTemplateButtonClicked, { projectTemplateId });
      setModalOpened(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCloseModal = useCallback(() => {
      trackEventByName(tracks.useTemplateModalClosed, { projectTemplateId });
      setModalOpened(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onGoBack = useCallback(() => {
      goBack ? goBack() : clHistory.push('/admin/projects');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (onRender) {
        onRender(true);
      }
    }, [onRender]);

    if (templateId) {
      return (
        <Container className={className || ''}>
          <AdminHeader>
            {goBack ? (
              <Button buttonStyle="text" icon="arrow-back" onClick={onGoBack}>
                <FormattedMessage {...messages.goBack} />
              </Button>
            ) : (
              <Button buttonStyle="text" icon="list" onClick={onGoBack}>
                <FormattedMessage {...messages.seeMoreTemplates} />
              </Button>
            )}
            <Button onClick={onOpenModal} buttonStyle="admin-dark">
              <FormattedMessage {...messages.useTemplate} />
            </Button>
          </AdminHeader>

          <ProjectTemplatePreview projectTemplateId={templateId} />

          <UseTemplateModal
            projectTemplateId={projectTemplateId as string}
            opened={modalOpened}
            emitSuccessEvent={true}
            showGoBackLink={true}
            close={onCloseModal}
          />
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(ProjectTemplatePreviewAdmin);
