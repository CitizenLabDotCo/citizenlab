import React, { memo, useCallback, useState } from 'react';

// utils
import eventEmitter from 'utils/eventEmitter';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

// components
import Button from 'components/UI/Button';
import UseTemplateModal from './UseTemplateModal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

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
  color: ${colors.adminTextColor};
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

const UseTemplateButton = styled(Button)``;

const MoreDetailsButton = styled(Button)`
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
    const [modalOpened, setModalOpened] = useState<boolean>(false);

    const onMoreDetailsBtnClick = useCallback(() => {
      trackEventByName(tracks.moreDetailsButtonClicked, {
        projectTemplateId,
        title,
      });
      eventEmitter.emit<string>(
        'ProjectTemplateCardClicked',
        projectTemplateId
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onOpenModal = useCallback(() => {
      trackEventByName(tracks.useTemplateButtonClicked, {
        projectTemplateId,
        title,
      });
      setModalOpened(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCloseModal = useCallback(() => {
      trackEventByName(tracks.useTemplateModalClosed, {
        projectTemplateId,
        title,
      });
      setModalOpened(false);
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
            onClick={onOpenModal}
            buttonStyle="secondary"
            fullWidth={true}
            bgColor={darken(0.05, colors.lightGreyishBlue)}
            bgHoverColor={darken(0.1, colors.lightGreyishBlue)}
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
          opened={modalOpened}
          close={onCloseModal}
        />
      </Container>
    );
  }
);

export default ProjectTemplateCard;
