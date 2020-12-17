import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Modal from 'components/UI/Modal';
import SharingButtons from 'components/Sharing/SharingButtons';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';

// i18n
import T from 'components/T';
import messages from 'containers/ProjectsShowPage/messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';

const Container = styled.div`
  padding: 25px;
`;

interface Props {
  projectId: string;
  opened: boolean;
  className?: string;
  close: () => void;
}

const ProjectSharingModal = memo<Props & InjectedIntlProps>(
  ({ projectId, className, opened, close, intl: { formatMessage } }) => {
    const authUser = useAuthUser();
    const project = useProject({ projectId });

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

    if (!isNilOrError(project)) {
      return (
        <Modal
          width={450}
          opened={opened}
          close={onClose}
          closeOnClickOutside={false}
          noClose={false}
          header={<FormattedMessage {...messages.shareThisProject} />}
        >
          <Container className={className}>
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
                          }
                        )}
                        twitterMessage={formatMessage(messages.twitterMessage, {
                          title,
                        })}
                        utmParams={utmParams}
                        layout={'columnLayout'}
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
  }
);

export default injectIntl(ProjectSharingModal);
