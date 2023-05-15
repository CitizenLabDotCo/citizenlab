import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Modal from 'components/UI/Modal';
import SharingButtons from 'components/Sharing/SharingButtons';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

// i18n
import T from 'components/T';
import messages from 'containers/ProjectsShowPage/messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

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
    const { data: project } = useProjectById(projectId);

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

    if (project) {
      const url = window.location.href;
      return (
        <Modal
          width={550}
          opened={opened}
          close={onClose}
          closeOnClickOutside={true}
          header={<T value={project.data.attributes.title_multiloc} />}
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
                <T
                  value={project.data.attributes.title_multiloc}
                  maxLength={50}
                >
                  {(title) => {
                    return (
                      <SharingButtons
                        context="project"
                        url={projectUrl}
                        whatsAppMessage={formatMessage(
                          messages.whatsAppMessage,
                          {
                            projectName: title,
                          }
                        )}
                        facebookMessage={formatMessage(
                          messages.facebookMessage,
                          {
                            projectName: title,
                          }
                        )}
                        twitterMessage={formatMessage(
                          messages.projectTwitterMessage,
                          {
                            projectName: title,
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
