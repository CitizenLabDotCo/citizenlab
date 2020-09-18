import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Modal from 'components/UI/Modal';
import Sharing from 'components/Sharing';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';

// i18n
import T from 'components/T';
import messages from 'containers/ProjectsShowPage/messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const ProjectTitle = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
`;

interface Props {
  projectId: string;
  opened: boolean;
  className?: string;
  close: () => void;
}

const ProjectSharingModal = memo<Props & InjectedIntlProps>(
  ({ projectId, className, opened, close, intl }) => {
    const authUser = useAuthUser();
    const project = useProject({ projectId });

    const projectUrl = location.href;
    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_project',
          campaign: 'share_content',
          content: authUser.data.id,
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
        >
          <Container className={className}>
            {opened && (
              <>
                <ProjectTitle>
                  <T value={project.attributes.title_multiloc} />
                </ProjectTitle>
                <T value={project.attributes.title_multiloc} maxLength={50}>
                  {(title) => {
                    return (
                      <Sharing
                        context="project"
                        url={projectUrl}
                        twitterMessage={intl.formatMessage(
                          messages.twitterMessage,
                          {
                            title,
                          }
                        )}
                        utmParams={utmParams}
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
