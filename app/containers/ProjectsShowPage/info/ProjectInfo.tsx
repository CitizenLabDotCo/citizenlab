import React from 'react';
import 'moment-timezone';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ImageZoom from 'react-medium-image-zoom';
import Fragment from 'components/Fragment';
import Sharing from 'components/Sharing';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import T from 'components/T';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { media, quillEditedContent } from 'utils/styleUtils';

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
  color: #333;
  font-size: 18px;
  line-height: 26px;
  font-weight: 300;

  img {
    max-width: 100%;
  }

  h1 {
    font-size: 29px;
    line-height: 35px;
    font-weight: 600;
  }

  h2 {
    font-size: 24px;
    line-height: 29px;
    font-weight: 600;
  }

  h3 {
    font-size: 21px;
    line-height: 26px;
    font-weight: 600;
  }

  h4 {
    font-size: 18px;
    line-height: 26px;
    font-weight: 600;
  }

  p {
    margin-bottom: 35px;
  }

  strong {
    font-weight: 500;
  }

  a {
    color: ${(props) => props.theme.colors.clBlueDark};
    text-decoration: underline;

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.clBlueDark)};
    }
  }

  ${quillEditedContent()}
`;

const ProjectImages = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-top: -5px;
  width: calc(100% + 10px);

  img {
    margin: 5px;
    border-radius: 5px;
    border: solid 1px #e0e0e0;

    &:first-child {
      width: calc(100% - 10px);
    }

    &:not(:first-child) {
      width: calc(33% - 9px);
    }
  }
`;

const StyledSharing = styled(Sharing) `
  margin-top: 40px;
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
  projectImages: GetProjectImagesChildProps;
  authUser: GetAuthUserChildProps;
}
interface Props extends InputProps, DataProps { }

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  projectImages: ({ projectId, render }) => <GetProjectImages projectId={projectId}>{render}</GetProjectImages>,
  authUser: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
});

const ProjectInfo = (props: Props & InjectedIntlProps) => {
  const { project, projectImages, authUser, intl: { formatMessage } } = props;
  if (isNilOrError(project)) return null;
  const userId = !isNilOrError(authUser) ? authUser.id : null;

  return (
    <Container>
      <Fragment name={`projects/${project.id}/info`}>
        <Left>
          <ProjectDescriptionStyled>
            <T value={project.attributes.description_multiloc} />
          </ProjectDescriptionStyled>
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
                <StyledSharing
                  twitterMessage={formatMessage(messages.twitterMessage, { title })}
                  userId={userId}
                  sharedContent="project"
                />);
            }}
          </T>
        </Right>
      </Fragment>
    </Container>
  );
};

const ProjectInfoWhithHoc = injectIntl<DataProps & InputProps>(ProjectInfo);

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
