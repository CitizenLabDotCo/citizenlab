import React, { memo, useState, useCallback, FormEvent } from 'react';

import styled from 'styled-components';

import { IProjectFolderData } from 'api/project_folders/types';

import ProjectFolderSharingModal from 'components/ProjectFolders/ProjectFolderSharingModal';
import ButtonWithLink, {
  Props as ButtonProps,
} from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.div``;

const ShareButton = styled(ButtonWithLink)``;

interface Props extends Omit<ButtonProps, 'onClick'> {
  projectFolder: IProjectFolderData;
  className?: string;
}

const ProjectFolderShareButton = memo<Props>(
  ({ projectFolder, className, ...buttonContainerProps }) => {
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
              {...buttonContainerProps}
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
  }
);

export default ProjectFolderShareButton;
