import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Modal from 'components/UI/Modal';
import SharingButtons from 'components/Sharing/SharingButtons';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProjectFolder from 'modules/project_folders/hooks/useProjectFolder';

// i18n
import T from 'components/T';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px 25px;
  margin-left: auto;
  margin-right: auto;
`;

interface Props {
  projectFolderId: string;
  opened: boolean;
  className?: string;
  close: () => void;
}

const ProjectFolderSharingModal = memo<
  Props & InjectedIntlProps & InjectedLocalized
>(({ projectFolderId, className, opened, close, intl: { formatMessage } }) => {
  const authUser = useAuthUser();
  const projectFolder = useProjectFolder({ projectFolderId });

  const folderUrl = location.href;
  const utmParams = !isNilOrError(authUser)
    ? {
        source: 'share_folder',
        campaign: 'share_content',
        content: authUser.id,
      }
    : {
        source: 'share_folder',
        campaign: 'share_content',
      };

  const onClose = useCallback(() => {
    close();
  }, [close]);

  if (!isNilOrError(projectFolder)) {
    return (
      <Modal
        width={550}
        opened={opened}
        close={onClose}
        closeOnClickOutside={true}
        noClose={false}
        header={<T value={projectFolder.attributes.title_multiloc} />}
      >
        <Container className={className || ''}>
          {opened && (
            <>
              <T value={projectFolder.attributes.title_multiloc} maxLength={50}>
                {(projectFolderName) => {
                  return (
                    <SharingButtons
                      context="folder"
                      url={folderUrl}
                      twitterMessage={formatMessage(messages.twitterMessage, {
                        projectFolderName,
                      })}
                      whatsAppMessage={formatMessage(messages.whatsAppMessage, {
                        projectFolderName,
                      })}
                      utmParams={utmParams}
                      layout="columnLayout"
                    />
                  );
                }}
              </T>
            </>
          )}
        </Container>
      </Modal>
    );
  }

  return null;
});

export default injectIntl(injectLocalize(ProjectFolderSharingModal));
