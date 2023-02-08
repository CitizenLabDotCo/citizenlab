import React, { memo } from 'react';

// components
import ProjectFolderShareButton from '../../components/ProjectFolders/ProjectFolderShareButton';
import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IProjectFolderData } from 'services/projectFolders';

const StyledProjectFolderShareButton = styled(ProjectFolderShareButton)`
  position: absolute;
  right: 25px;
  bottom: 20px;

  ${media.tablet`
    right: 10px;
    top: 10px;
  `};
`;

interface Props {
  projectFolder: IProjectFolderData;
  className?: string;
}

const ProjectFolderHeader = memo<Props>(({ projectFolder, className }) => {
  const { windowWidth } = useWindowSize();

  const smallerThan1100px = windowWidth ? windowWidth <= 1100 : false;

  if (projectFolder.attributes?.header_bg?.large) {
    return (
      <HeaderImageContainer className={`${className || ''} e2e-header-folder`}>
        <HeaderImage
          src={projectFolder.attributes?.header_bg.large}
          cover={true}
          fadeIn={false}
          isLazy={false}
          placeholderBg="transparent"
          alt=""
        />
        <StyledProjectFolderShareButton
          projectFolder={projectFolder}
          buttonStyle="white"
          padding={smallerThan1100px ? '4px 10px' : '6px 13px'}
        />
      </HeaderImageContainer>
    );
  }

  return null;
});

export default ProjectFolderHeader;
