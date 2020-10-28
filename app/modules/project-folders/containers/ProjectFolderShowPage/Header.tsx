import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';

// resources
import GetProjectFolder, {
  GetProjectFolderChildProps,
} from 'resources/GetProjectFolder';

// i18n
import T from 'components/T';

// style
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 40px;
  padding-bottom: 40px;
  position: relative;
  z-index: 3;
  background: #767676;

  ${media.smallerThanMinTablet`
    min-height: 200px;
  `}
`;

const HeaderContent = styled(ContentContainer)``;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: ${fontSizes.xxxxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxl}px;
    font-weight: 600;
  `}
`;

const HeaderOverlay = styled.div`
  background: #000;
  opacity: 0.55;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImage: any = styled.div`
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

interface InputProps {
  projectFolderId: string;
}

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
}

interface Props extends InputProps, DataProps {}

class ProjectFolderShowPageHeader extends PureComponent<Props> {
  render() {
    const { projectFolder } = this.props;

    if (!isNilOrError(projectFolder)) {
      const projectHeaderImageLarge =
        projectFolder?.attributes?.header_bg?.large;

      return (
        <Container className="e2e-header-folder">
          <HeaderImage src={projectHeaderImageLarge || null} />
          <HeaderOverlay />
          <HeaderContent>
            <HeaderTitle>
              <T value={projectFolder.attributes.title_multiloc} />
            </HeaderTitle>
          </HeaderContent>
        </Container>
      );
    }

    return null;
  }
}

// TODO refactor to memo + hooks

const Data = adopt<DataProps, InputProps>({
  projectFolder: ({ projectFolderId, render }) => (
    <GetProjectFolder projectFolderId={projectFolderId}>
      {render}
    </GetProjectFolder>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectFolderShowPageHeader {...inputProps} {...dataProps} />
    )}
  </Data>
);
