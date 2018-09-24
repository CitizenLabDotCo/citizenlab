import React from 'react';
import 'moment-timezone';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ImageZoom from 'react-medium-image-zoom';
import Fragment from 'components/Fragment';
import Sharing from 'components/Sharing';
import FileAttachments from 'components/UI/FileAttachments';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import T from 'components/T';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { media, quillEditedContent, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 70px;
  margin-bottom: 90px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 50px;
    margin-bottom: 60px;
  `}
`;

const Left = styled.section`
  flex: 3;

  ${media.smallerThanMinTablet`
    flex: 1;
  `}
`;

const Right = styled.aside`
  flex: 2;
  max-width: 400px;
  margin-left: 80px;

  ${media.smallerThanMinTablet`
    flex: 1;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-top: 20px;
  `}
`;

const ProjectDescriptionStyled = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  line-height: 25px;

  h1 {
    font-size: ${fontSizes.xxxl}px;
    line-height: 35px;
    font-weight: 600;
  }

  h2 {
    font-size: ${fontSizes.xxl}px;
    line-height: 33px;
    font-weight: 600;
  }

  h3 {
    font-size: ${fontSizes.xl}px;
    line-height: 26px;
    font-weight: 600;
  }

  h4 {
    font-size: ${fontSizes.large}px;
    line-height: 26px;
    font-weight: 600;
  }

  p {
    color: ${colors.text};
    font-size: ${fontSizes.large}px;
    font-weight: 300;
    line-height: 27px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${colors.clBlueDark};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }

  ul {
    list-style-type: disc;
    list-style-position: outside;
    padding: 0;
    padding-left: 25px;
    margin: 0;
    margin-bottom: 25px;

    li {
      padding: 0;
      padding-top: 2px;
      padding-bottom: 2px;
      margin: 0;
    }
  }

  img {
    max-width: 100%;
  }

  strong {
    font-weight: 500;
  }

  ${quillEditedContent()}
`;

const ProjectImages = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-top: -5px;
  margin-bottom: 30px;
  width: calc(100% + 10px);

  img {
    margin: 5px;
    border-radius: 5px;
    border: solid 1px ${colors.separation};

    &:first-child {
      width: calc(100% - 10px);
    }

    &:not(:first-child) {
      width: calc(33% - 9px);
    }
  }
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
  projectImages: GetProjectImagesChildProps;
  projectFiles: GetResourceFileObjectsChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectInfo = (props: Props & InjectedIntlProps) => {
  const { project, projectImages, projectFiles, intl: { formatMessage } } = props;
  if (isNilOrError(project)) return null;

  const projectUrl = location.href;

  return (
    <Container>
      <Fragment name={`projects/${project.id}/info`}>
        <Left>
          <ProjectDescriptionStyled>
            <T value={project.attributes.description_multiloc} supportHtml={true}/>
          </ProjectDescriptionStyled>
          {projectFiles && !isNilOrError(projectFiles) &&
            <FileAttachments files={projectFiles} />
          }
        </Left>

        <Right>
          {!isNilOrError(projectImages) && projectImages.length > 0 &&
            <ProjectImages>
              {projectImages.filter(projectImage => projectImage).map((projectImage, index) => (
                <ImageZoom
                  key={projectImage.id}
                  image={{
                    src: projectImage.attributes.versions.large,
                    alt: formatMessage(messages.imageAltText, { index: index + 1 })
                  }}
                  zoomImage={{
                    src: projectImage.attributes.versions.large,
                    alt: formatMessage(messages.imageAltText, { index: index + 1 })
                  }}
                />
              ))}
            </ProjectImages>
          }
          <T value={project.attributes.title_multiloc} maxLength={50} >
            {(title) => {
              return (
                <Sharing
                  url={projectUrl}
                  twitterMessage={formatMessage(messages.twitterMessage, { title })}
                />);
            }}
          </T>
        </Right>
      </Fragment>
    </Container>
  );
};

const ProjectInfoWhithHoc = injectIntl<DataProps & InputProps>(ProjectInfo);

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  projectImages: ({ projectId, render }) => <GetProjectImages projectId={projectId}>{render}</GetProjectImages>,
  projectFiles: ({ projectId, render }) => <GetResourceFileObjects resourceId={projectId} resourceType="project">{render}</GetResourceFileObjects>,
  authUser: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => {
      if (isNilOrError(dataProps.project)) return null;

      return (
        <ProjectInfoWhithHoc
          {...inputProps}
          {...dataProps}
        />
      );
    }}
  </Data>
);
