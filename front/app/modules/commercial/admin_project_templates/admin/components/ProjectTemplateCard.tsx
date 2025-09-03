import React, { memo, useCallback, useState } from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import tracks from '../../tracks';
import ProjectTemplatePreviewAdmin from '../containers/ProjectTemplatePreviewAdmin';

import messages from './messages';
import UseTemplateModal from './UseTemplateModal';

const duration = 300;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const Image = styled.div<{ src: string }>`
  width: 100%;
  height: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
  margin-bottom: 10px;
  transition: all ${duration - 50}ms ease-out;
`;

const Content = styled.div`
  height: 400px;
  background: #f2f4f5;
  transition: all ${duration}ms ${easing};
`;

const Title = styled.h3`
  color: ${colors.primary};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  padding: 0;
  margin: 0;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const Subtitle = styled.div`
  color: #808080;
`;

const Buttons = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -102px;
  opacity: 0;
  transition: all ${duration}ms ${easing};
`;

const UseTemplateButton = styled(ButtonWithLink)``;

const MoreDetailsButton = styled(ButtonWithLink)`
  margin-top: 10px;
`;

const Container = styled.div`
  width: 100%;
  height: 263px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background: #f2f4f5;
  border: solid 1px #eaeaea;
  overflow: hidden;
  position: relative;

  &:hover {
    &.hasImage {
      ${Image} {
        opacity: 0;
      }

      ${Content} {
        transform: translateY(-128px);
      }
    }

    ${Buttons} {
      opacity: 1;
      transform: translateY(-118px);
    }
  }
`;

interface Props {
  projectTemplateId: string;
  imageUrl: string | null;
  title: string;
  body: string;
  className?: string;
}

const ProjectTemplateCard = memo<Props>(
  ({ projectTemplateId, imageUrl, title, body, className }) => {
    const [useTemplateModalOpened, setUseTemplateModalOpened] =
      useState<boolean>(false);
    const [previewModalOpened, setPreviewModalOpened] =
      useState<boolean>(false);

    const onMoreDetailsBtnClick = useCallback(() => {
      trackEventByName(tracks.moreDetailsButtonClicked, {
        projectTemplateId,
        title,
      });
      setPreviewModalOpened(true);
    }, [projectTemplateId, title]);

    const onOpenUseTemplateModal = useCallback(() => {
      trackEventByName(tracks.useTemplateButtonClicked, {
        projectTemplateId,
        title,
      });
      setUseTemplateModalOpened(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCloseUseTemplateModal = useCallback(() => {
      trackEventByName(tracks.useTemplateModalClosed, {
        projectTemplateId,
        title,
      });
      setUseTemplateModalOpened(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Container className={`${className} ${imageUrl ? 'hasImage' : ''}`}>
        {imageUrl && <Image src={imageUrl} />}

        <Content>
          <Title className="e2e-card-title">{title}</Title>

          <Subtitle>{body}</Subtitle>
        </Content>

        <Buttons>
          <UseTemplateButton
            onClick={onOpenUseTemplateModal}
            buttonStyle="secondary-outlined"
            fullWidth={true}
            bgColor={darken(0.05, colors.grey200)}
            bgHoverColor={darken(0.1, colors.grey200)}
          >
            <FormattedMessage {...messages.useTemplate} />
          </UseTemplateButton>

          <MoreDetailsButton
            onClick={onMoreDetailsBtnClick}
            buttonStyle="admin-dark"
            fullWidth={true}
          >
            <FormattedMessage {...messages.moreDetails} />
          </MoreDetailsButton>
        </Buttons>

        <UseTemplateModal
          projectTemplateId={projectTemplateId}
          opened={useTemplateModalOpened}
          close={onCloseUseTemplateModal}
        />
        <Modal
          opened={previewModalOpened}
          close={() => {
            setPreviewModalOpened(false);
          }}
          width={'95%'}
        >
          <Box width="100%" display="flex" justifyContent="center">
            <ProjectTemplatePreviewAdmin
              projectTemplateId={projectTemplateId}
            />
          </Box>
        </Modal>
      </Container>
    );
  }
);

export default ProjectTemplateCard;
