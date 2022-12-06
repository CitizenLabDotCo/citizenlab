import React, { memo, useCallback } from 'react';
import { WrappedComponentProps } from 'react-intl';
// style
import { Box } from '@citizenlab/cl2-component-library';
// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProjectFolder from 'hooks/useProjectFolder';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import SharingButtons from 'components/Sharing/SharingButtons';
// i18n
import T from 'components/T';
// components
import Modal from 'components/UI/Modal';
import messages from './messages';

interface Props {
  projectFolderId: string;
  opened: boolean;
  className?: string;
  close: () => void;
}

const ProjectFolderSharingModal = memo<
  Props & WrappedComponentProps & InjectedLocalized
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
        header={<T value={projectFolder.attributes.title_multiloc} />}
      >
        <Box
          width="100%"
          maxWidth="400px"
          padding="40px 25px"
          mx="auto"
          style={{ textAlign: 'center' }}
          className={className}
        >
          {opened && (
            <>
              <T value={projectFolder.attributes.title_multiloc} maxLength={50}>
                {(projectFolderName) => {
                  return (
                    <SharingButtons
                      context="folder"
                      url={folderUrl}
                      facebookMessage={formatMessage(messages.facebookMessage, {
                        projectFolderName,
                      })}
                      twitterMessage={formatMessage(messages.twitterMessage, {
                        projectFolderName,
                      })}
                      whatsAppMessage={formatMessage(messages.whatsAppMessage, {
                        projectFolderName,
                      })}
                      emailSubject={formatMessage(
                        messages.emailSharingSubject,
                        {
                          projectFolderName: projectFolderName.toString(),
                        }
                      )}
                      emailBody={formatMessage(messages.emailSharingBody, {
                        folderUrl,
                        projectFolderName,
                      })}
                      utmParams={utmParams}
                    />
                  );
                }}
              </T>
            </>
          )}
        </Box>
      </Modal>
    );
  }

  return null;
});

export default injectIntl(injectLocalize(ProjectFolderSharingModal));
