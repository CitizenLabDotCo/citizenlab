import React from 'react';

// styling
import styled from 'styled-components';
import { defaultCardStyle, media, fontSizes } from 'utils/styleUtils';

// components
import { Image } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { MessageDescriptor } from 'react-intl';

// svg
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';

const Container = styled.div`
  width: 100%;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.tenantText};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0;
  margin-bottom: 43px;
  position: relative;
  ${defaultCardStyle};
`;

const EmptyProjectsImage = styled(Image)`
  width: 100%;
  height: auto;

  ${media.tablet`
    &.objectFitCoverSupported {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:not(.objectFitCoverSupported) {
      width: auto;
      height: 100%;
    }
  `}
`;

export const EmptyMessage = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const EmptyMessageTitle = styled.h2`
  font-weight: 600;
  font-size: ${fontSizes.xl}px;
  white-space: nowrap;
  margin-bottom: 5px;

  ${media.phone`
    font-size: ${fontSizes.l}px;
  `};
`;

const EmptyMessageLine = styled.p`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 25px;
  text-align: center;
`;

interface Props {
  titleMessage: MessageDescriptor;
  descriptionMessage: MessageDescriptor;
}

const EmptyContainer = ({ titleMessage, descriptionMessage }: Props) => {
  const objectFitCoverSupported =
    window['CSS'] &&
    typeof CSS !== 'undefined' &&
    CSS.supports &&
    CSS.supports('object-fit: cover');

  return (
    <Container id="projects-empty">
      <EmptyProjectsImage
        alt="" // Image is decorative, so alt tag is empty
        src={EmptyProjectsImageSrc}
        className={objectFitCoverSupported ? 'objectFitCoverSupported' : ''}
      />
      <EmptyMessage>
        <EmptyMessageTitle>
          <FormattedMessage {...titleMessage} />
        </EmptyMessageTitle>
        <EmptyMessageLine>
          <FormattedMessage {...descriptionMessage} />
        </EmptyMessageLine>
      </EmptyMessage>
    </Container>
  );
};

export default EmptyContainer;
