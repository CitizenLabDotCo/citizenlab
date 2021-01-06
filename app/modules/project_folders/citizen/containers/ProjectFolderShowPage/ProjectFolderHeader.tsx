import React, { memo } from 'react';

// components
import LazyImage from 'components/LazyImage';
import ProjectFolderShareButton from 'modules/project_folders/citizen/components/ProjectFolderShareButton';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

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

const HeaderImage = styled(LazyImage)`
  flex: 1;
  width: 100%;
`;

const StyledProjectFolderShareButton = styled(ProjectFolderShareButton)`
  position: absolute;
  right: 25px;
  bottom: 15px;

  ${media.smallerThanMaxTablet`
    right: 12px;
    top: 12px;
  `};
`;

interface Props {
  projectFolder: IProjectFolderData;
  className?: string;
}

const ProjectFolderHeader = memo<Props>(({ projectFolder, className }) => {
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
          buttonStyle="primary"
          bgColor="rgba(255,255,255,0.85)"
          bgHoverColor="#fff"
          padding="6px 13px"
          iconColor={colors.text}
          iconHoverColor="#000"
          textColor={colors.text}
          textHoverColor="#000"
        />
      </Container>
    );
  }

  return null;
});

export default ProjectFolderHeader;
