import React, { memo, useCallback } from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const duration = 350;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const ImageWrapperWrapper = styled.div`
  width: 100%;
  height: 118px;
  overflow: hidden;
  transition: all ${duration}ms ${easing};
`;

const ImageWrapper = styled.div`
  height: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const Image = styled.img`
  width: 100%;
`;

const Content = styled.div`
  background: red;
  height: 200px;
  transition: all ${duration}ms ${easing};
`;

const Title = styled.h3`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: normal;
  margin: 0;
  margin-top: 15px;
  margin-bottom: 5px;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Subtitle = styled.div`
  color: #808080;
  flex-grow: 1;
`;

const Buttons = styled.div`
  opacity: 0;
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -118px;
  transition: all ${duration}ms ${easing};

  opacity: 1;
  bottom: 20px;
`;

const UseTemplateButton = styled(Button)``;

const MoreDetailsButton = styled(Button)`
  margin-top: 10px;
`;

const Container = styled.div`
  width: 100%;
  height: 263px;
  /* cursor: pointer; */
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background: rgba(132, 147, 158, 0.1);
  border: solid 1px #eaeaea;
  position: relative;
  overflow: hidden;

  &:hover {
    /* ${ImageWrapperWrapper} {
      height: 0px;
      opacity: 0;
    } */

    ${Content} {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      bottom: 0px;
      z-index: 1;
    }

    ${Buttons} {
      opacity: 1;
      bottom: 20px;
      z-index: 2;
    }
  }
`;

interface Props {
  projectTemplateId: string;
  imageUrl: string | null;
  title: string;
  body: string;
  onPreviewButtonClick: (projectTemplateId: string) => void;
  className?: string;
}

const ProjectTemplateCard = memo<Props>(({ projectTemplateId, imageUrl, title, body, onPreviewButtonClick, className }) => {

  const handleUseTemplateOnClick = useCallback(() => {
    // empty
  }, []);

  const handleMoreDetailsOnClick = useCallback(() => {
    onPreviewButtonClick(projectTemplateId);
  }, []);

  return (
    <Container className={className}>
      {imageUrl &&
        <ImageWrapperWrapper>
          <ImageWrapper>
            <Image src={imageUrl} />
          </ImageWrapper>
        </ImageWrapperWrapper>
      }

      <Content>
        <Title className="e2e-card-title">
          {title}
        </Title>

        <Subtitle>
          {body}
        </Subtitle>
      </Content>

      <Buttons>
        <UseTemplateButton
          onClick={handleUseTemplateOnClick}
          style="secondary"
          fullWidth={true}
          bgColor={darken(0.05, colors.lightGreyishBlue)}
          bgHoverColor={darken(0.1, colors.lightGreyishBlue)}
        >
          <FormattedMessage {...messages.useTemplate} />
        </UseTemplateButton>

        <MoreDetailsButton
          onClick={handleMoreDetailsOnClick}
          style="admin-dark"
          fullWidth={true}
        >
          <FormattedMessage {...messages.moreDetails} />
        </MoreDetailsButton>
      </Buttons>
    </Container>
  );
});

export default ProjectTemplateCard;
