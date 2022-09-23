import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import SharingButtons from 'components/Sharing/SharingButtons';
import Modal from 'components/UI/Modal';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';
import useProjectFolder from '../../../hooks/useProjectFolder';

// i18n
import T from 'components/T';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// style
import { Box } from '@citizenlab/cl2-component-library';

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
  const appConfig = useAppConfiguration();
  const localize = useLocalize();
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

  if (!isNilOrError(projectFolder) && !isNilOrError(appConfig)) {
    const orgName = localize(
      appConfig.attributes.settings.core.organization_name
    );
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
                        orgName,
                      })}
                      twitterMessage={formatMessage(messages.twitterMessage, {
                        projectFolderName,
                      })}
                      whatsAppMessage={formatMessage(messages.whatsAppMessage, {
                        projectFolderName,
                        orgName,
                      })}
                      emailSubject={formatMessage(
                        messages.emailSharingSubject,
                        {
                          orgName,
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
