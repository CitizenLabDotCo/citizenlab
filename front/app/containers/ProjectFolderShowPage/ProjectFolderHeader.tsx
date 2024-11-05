import React, { memo } from 'react';

import { useWindowSize, Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IProjectFolderData } from 'api/project_folders/types';

import useLocalize from 'hooks/useLocalize';

import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';

import ProjectFolderShareButton from '../../components/ProjectFolders/ProjectFolderShareButton';

const StyledProjectFolderShareButton = styled(ProjectFolderShareButton)`
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
  const localize = useLocalize();

  const smallerThan1100px = windowWidth ? windowWidth <= 1100 : false;
  const folderHeaderImageAltText = localize(
    projectFolder.attributes.header_bg_alt_text_multiloc
  );

  if (projectFolder.attributes.header_bg?.large) {
    return (
      <HeaderImageContainer className={`${className || ''} e2e-header-folder`}>
        <HeaderImage
          src={projectFolder.attributes.header_bg.large}
          cover={true}
          fadeIn={false}
          isLazy={false}
          placeholderBg="transparent"
          alt={folderHeaderImageAltText}
        />
        <Box
          position="absolute"
          bottom="20px"
          right="25px"
          display="flex"
          justifyContent="center"
        >
          <StyledProjectFolderShareButton
            projectFolder={projectFolder}
            buttonStyle="white"
            padding={smallerThan1100px ? '4px 10px' : '6px 13px'}
          />
        </Box>
      </HeaderImageContainer>
    );
  }

  return null;
});

export default ProjectFolderHeader;
