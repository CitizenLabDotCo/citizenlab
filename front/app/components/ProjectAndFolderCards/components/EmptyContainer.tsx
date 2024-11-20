import React from 'react';

import {
  defaultCardStyle,
  media,
  fontSizes,
  Image,
} from '@citizenlab/cl2-component-library';
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

// svg

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    window['CSS'] &&
    typeof CSS !== 'undefined' &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
