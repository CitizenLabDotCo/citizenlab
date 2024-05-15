import React, { memo, useCallback, useState } from 'react';

import { get } from 'lodash-es';
import styled from 'styled-components';

import tracks from 'containers/Admin/projects/all/tracks';

import Button from 'components/UI/Button';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

import ProjectTemplatePreview from '../../components/ProjectTemplatePreview';
import UseTemplateModal from '../components/UseTemplateModal';

import messages from './messages';

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  margin-bottom: 60px;
`;

const AdminHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 30px;
  margin-left: -20px;
`;

export interface Props {
  projectTemplateId?: string;
  className?: string;
}

const ProjectTemplatePreviewAdmin = memo<Props & WithRouterProps>(
  ({ params, projectTemplateId, className }) => {
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

    if (templateId) {
      return (
        <Container className={className || ''}>
          <AdminHeader>
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
