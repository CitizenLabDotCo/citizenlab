import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import Modal from 'components/UI/Modal';
import SharingButtons from 'components/Sharing/SharingButtons';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolderbById from 'api/project_folders/useProjectFolderById';
import { useIntl } from 'utils/cl-intl';

import T from 'components/T';
import messages from './messages';

// style
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  projectFolderId: string;
  opened: boolean;
  className?: string;
  close: () => void;
}

const ProjectFolderSharingModal = memo<Props>(
  ({ projectFolderId, className, opened, close }) => {
    const { data: authUser } = useAuthUser();
    const { data: projectFolder } = useProjectFolderbById(projectFolderId);
    const { formatMessage } = useIntl();

    const folderUrl = location.href;
    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_folder',
          campaign: 'share_content',
          content: authUser.data.id,
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
          header={<T value={projectFolder.data.attributes.title_multiloc} />}
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
                <T
                  value={projectFolder.data.attributes.title_multiloc}
                  maxLength={50}
                >
                  {(projectFolderName) => {
                    return (
                      <SharingButtons
                        context="folder"
                        url={folderUrl}
                        twitterMessage={formatMessage(messages.twitterMessage, {
                          projectFolderName,
                        })}
                        whatsAppMessage={formatMessage(
                          messages.whatsAppMessage,
                          {
                            projectFolderName,
                          }
                        )}
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
  }
);

export default ProjectFolderSharingModal;
