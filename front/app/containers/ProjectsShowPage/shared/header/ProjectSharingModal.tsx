import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import SharingButtons from 'components/Sharing/SharingButtons';
import Modal from 'components/UI/Modal';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';
import useProject from 'hooks/useProject';

// i18n
import T from 'components/T';
import messages from 'containers/ProjectsShowPage/messages';
import { injectIntl, WrappedComponentProps } from 'react-intl';

// style
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  projectId: string;
  opened: boolean;
  className?: string;
  close: () => void;
}

const ProjectSharingModal = memo<Props & WrappedComponentProps>(
  ({ projectId, className, opened, close, intl: { formatMessage } }) => {
    const authUser = useAuthUser();
    const project = useProject({ projectId });
    const localize = useLocalize();
    const appConfig = useAppConfiguration();

    const projectUrl = location.href;
    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_project',
          campaign: 'share_content',
          content: authUser.id,
        }
      : {
          source: 'share_project',
          campaign: 'share_content',
        };

    const onClose = useCallback(() => {
      close();
    }, [close]);

    if (!isNilOrError(project) && !isNilOrError(appConfig)) {
      const url = window.location.href;
      return (
        <Modal
          width={550}
          opened={opened}
          close={onClose}
          closeOnClickOutside={true}
          header={<T value={project.attributes.title_multiloc} />}
        >
          <Box
            width="100%"
            maxWidth="400px"
            padding="40px 25px"
            ml="auto"
            mr="auto"
            style={{ textAlign: 'center' }}
            className={className}
          >
            {opened && (
              <>
                <T value={project.attributes.title_multiloc} maxLength={50}>
                  {(title) => {
                    return (
                      <SharingButtons
                        context="project"
                        url={projectUrl}
                        whatsAppMessage={formatMessage(
                          messages.whatsAppMessage,
                          {
                            projectName: title,
                            orgName: localize(
                              appConfig.attributes.settings.core
                                .organization_name
                            ),
                          }
                        )}
                        facebookMessage={formatMessage(
                          messages.facebookMessage,
                          {
                            projectName: title,
                            orgName: localize(
                              appConfig.attributes.settings.core
                                .organization_name
                            ),
                          }
                        )}
                        twitterMessage={formatMessage(
                          messages.projectTwitterMessage,
                          {
                            projectName: title,
                            orgName: localize(
                              appConfig.attributes.settings.core
                                .organization_name
                            ),
                          }
                        )}
                        emailSubject={formatMessage(
                          messages.emailSharingSubject,
                          {
                            projectName: title,
                            initiativeTitle: title,
                            initiativeUrl: url,
                          }
                        )}
                        emailBody={formatMessage(messages.emailSharingBody, {
                          projectUrl: url,
                          projectName: title,
                          initiativeUrl: url,
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

export default injectIntl(ProjectSharingModal);
