import React from 'react';

// styling
import styled from 'styled-components';
import { defaultCardStyle, media, fontSizes } from 'utils/styleUtils';

// components
import { Image } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// svg
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';

const Container = styled.div`
  width: 100%;
  min-height: 200px;
  color: ${({ theme }) => theme.colorText};
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

  ${media.smallerThanMaxTablet`
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

const EmptyMessage = styled.div`
  color: ${({ theme }) => theme.colorText};
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

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
  `};
`;

const EmptyMessageLine = styled.p`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 25px;
  text-align: center;
`;

const EmptyContainer = () => {
  const objectFitCoverSupported =
    window['CSS'] && CSS.supports('object-fit: cover');

  return (
    <Container id="projects-empty">
      <EmptyProjectsImage
        alt="" // Image is decorative, so alt tag is empty
        src={EmptyProjectsImageSrc}
        className={objectFitCoverSupported ? 'objectFitCoverSupported' : ''}
      />
      <EmptyMessage>
        <EmptyMessageTitle>
          <FormattedMessage {...messages.noProjectYet} />
        </EmptyMessageTitle>
        <EmptyMessageLine>
          <FormattedMessage {...messages.stayTuned} />
        </EmptyMessageLine>
      </EmptyMessage>
    </Container>
  );
};

export default EmptyContainer;
