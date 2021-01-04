import React, { memo } from 'react';

// components
import LazyImage from 'components/LazyImage';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

const Container = styled.div`
  width: 100%;
  height: 250px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;
  display: flex;
  align-items: stretch;

  ${media.smallerThanMinTablet`
    height: 160px;
  `}
`;

const HeaderImage = styled(LazyImage)`
  flex: 1;
  width: 100%;
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
      </Container>
    );
  }

  return null;
});

export default ProjectFolderHeader;
