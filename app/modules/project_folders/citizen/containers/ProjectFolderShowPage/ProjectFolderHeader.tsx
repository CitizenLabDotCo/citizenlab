import React, { memo } from 'react';

// components
import Image from 'components/UI/Image';
import ProjectFolderShareButton from 'modules/project_folders/citizen/components/ProjectFolderShareButton';

// hooks
import useWindowSize from 'hooks/useWindowSize';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

const Container = styled.div`
  width: 100%;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;
  display: flex;
  align-items: stretch;
  position: relative;
`;

const HeaderImage = styled(Image)`
  flex: 1;
  width: 100%;
`;

const StyledProjectFolderShareButton = styled(ProjectFolderShareButton)`
  position: absolute;
  right: 25px;
  bottom: 20px;

  ${media.smallerThan1100px`
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
      <Container className={`${className || ''} e2e-header-folder`}>
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
      </Container>
    );
  }

  return null;
});

export default ProjectFolderHeader;
