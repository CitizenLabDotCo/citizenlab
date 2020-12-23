import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import LazyImage from 'components/LazyImage';

// hooks
import useProjectFolder from 'hooks/useProjectFolder';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div``;

const HeaderImage = styled(LazyImage)`
  width: 100%;
  height: 254px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  ${media.smallerThanMinTablet`
    height: 160px;
  `}
`;

interface Props {
  projectFolderId: string;
  className?: string;
}

const ProjectFolderHeader = memo<Props>(({ projectFolderId, className }) => {
  const projectFolder = useProjectFolder({ projectFolderId });

  if (
    !isNilOrError(projectFolder) &&
    projectFolder.attributes?.header_bg?.large
  ) {
    return (
      <Container className={`${className || ''} e2e-header-folder`}>
        <HeaderImage
          src={projectFolder.attributes?.header_bg.large}
          cover={true}
          placeholderBg="#fff"
          alt=""
        />
      </Container>
    );
  }

  return null;
});

export default ProjectFolderHeader;
