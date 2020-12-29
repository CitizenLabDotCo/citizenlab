import React, { memo, useState, useCallback, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import ProjectFolderSharingModal from 'modules/project_folders/citizen/components/ProjectFolderSharingModal';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

const Container = styled.div``;

const ShareButton = styled(Button)``;

interface Props {
  projectFolder: IProjectFolderData;
  className?: string;
}

const ProjectFolderShareButton = memo<Props>(({ projectFolder, className }) => {
  const [shareModalOpened, setShareModalOpened] = useState(false);

  const openShareModal = useCallback((event: FormEvent) => {
    event.preventDefault();
    setShareModalOpened(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalOpened(false);
  }, []);

  if (!isNilOrError(projectFolder)) {
    return (
      <>
        <Container className={className || ''}>
          <ShareButton
            icon="share"
            onClick={openShareModal}
            buttonStyle="white"
            padding="6px 12px"
          >
            <FormattedMessage {...messages.share} />
          </ShareButton>
        </Container>
        <ProjectFolderSharingModal
          projectFolderId={projectFolder.id}
          opened={shareModalOpened}
          close={closeShareModal}
        />
      </>
    );
  }

  return null;
});

export default ProjectFolderShareButton;
