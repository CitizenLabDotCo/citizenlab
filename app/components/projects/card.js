import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import T from 'containers/T';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { push } from 'react-router-redux';

import { selectProject, selectProjectImages } from './selectors';
import messages from './messages';

// const ProjectContainer = styled.div`
//   width: calc(50% - 10px);
//   height: 360px;
//   display: flex;
//   flex-direction: column;
//   border-radius: 8px;
//   border-bottom-left-radius: 8px;
//   border-bottom-right-radius: 8px;
//   background: #fff;
//   cursor: pointer;
//   margin-bottom: 20px;
//   -webkit-backface-visibility: hidden;
//   backface-visibility: hidden;
//   transition: all 250ms ease-out;

//   ${media.phone`
//     width: 100%;
//   `}

//   ${media.tablet`
//     width: 100%;
//   `}

//   ${media.desktop`
//     &:nth-child(even) {
//       margin-left: 20px;
//     }
//   `}

//   &:hover {
//     box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.2);
//     box-shadow: 0 0 10px 0 rgba(0,0,0,0.12), 0 15px 45px 0 rgba(0,0,0,0.12);
//     transform: scale(1.01);
//   }
// `;

// const ProjectImage = styled.div`
//   width: 100%;
//   height: 240px;
//   border-top-left-radius: 8px;
//   border-top-right-radius: 8px;
//   background-image: url(${projectImage});
//   background-repeat: no-repeat;
//   background-position: center top;
//   background-size: cover;
// `;

// const ProjectContent = styled.div`
//   padding-left: 20px;
//   padding-right: 20px;
//   padding-top: 15px;
//   padding-bottom: 20px;
// `;

// const ProjectTitle = styled.div`
//   color: #444;
//   font-size: 27px;
//   font-weight: 300;
//   line-height: 31px;
// `;

// const ProjectMeta = styled.div`
//   display: flex;
//   margin-top: 10px;
//   margin-left: -6px;
//   align-items: center;
// `;

// const ProjectMetaIcon = styled.svg`
//   fill: #aaa;
//   height: 22px;
//   margin-top: -2px;
// `;

// class Project extends React.Component {
//   render() {
//     const { title, description, goTo, id } = this.props;
//     return (
//       <ProjectContainer onClick={() => goTo(`projects/${id}`)}>
//         <ProjectImage></ProjectImage>
//         <ProjectContent>
//           <ProjectTitle><T value={title} /></ProjectTitle>
//           <ProjectTitle><T value={description} /></ProjectTitle>
//           <ProjectMeta>
//             <ProjectMetaIcon height="100%" viewBox="0 0 24 24">
//               <defs><path d="M0 0h24v24H0V0z" id="a" /></defs><clipPath id="b"><use overflow="visible" /></clipPath><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
//             </ProjectMetaIcon>
//           </ProjectMeta>
//         </ProjectContent>
//       </ProjectContainer>
//     );
//   }
// }

const ProjectContainer = styled.div`
  width: 100%;
  display: flex;
  height: 350px;
  background: #fff;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ProjectImage = styled.img`
  height: 100%;
  object-fit: cover;
  border-radius: 5px 0 0 5px;
`;

const ProjectInfo = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 15px;
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLogo = styled.img`
`;

const HeaderCount = styled.div`
  display: flex;
  color: ##8F8F8F;
  font-size: 16px;
  font-weight: 500;
`;

const InfoSeparator = styled.div`
  border: 1px solid #EAEAEA;
  height: 1px;
  margin: 5px 0;
`;

const InfoText = styled.div`
  flex-grow: 1;
`;

const TextTitle = styled.h3`
  color: #222222;
  font-size: 25px;
  font-weight: bold;
  padding: 15px 0;
`;

const TextBody = styled.h3`
  font-size: 16px;
  font-weight: 300;
  color: #6B6B6B;
`;

const InfoFooter = styled.div`
`;

const OpenProjectButton = styled(Button)`
  width: 100%;
`;

class Project extends React.Component {
  render() {
    const { project, tenantLogo, images } = this.props;
    if (!project) return null;

    const titleMultiloc = project.getIn(['attributes', 'title_multiloc']);
    const descriptionMultiloc = project.getIn(['attributes', 'description_multiloc']);
    const ideasCount = project.getIn(['attributes', 'ideas_count']);
    const image = images.first();
    const imageUrl = image && image.getIn(['attributes', 'versions', 'medium']);

    return (
      <ProjectContainer>
        <ProjectImage src={imageUrl} />
        <ProjectInfo>

          <InfoHeader>
            <HeaderLogo src={tenantLogo} />
            <HeaderCount>
              <Icon name="idea" />
              <FormattedMessage {...messages.xIdeas} values={{ x: ideasCount }} />
            </HeaderCount>
          </InfoHeader>

          <InfoSeparator />

          <InfoText>
            <TextTitle>
              <T value={titleMultiloc} />
            </TextTitle>
            <TextBody>
              <T value={descriptionMultiloc} />
            </TextBody>
          </InfoText>

          <InfoFooter>
            <OpenProjectButton>
              <FormattedMessage {...messages.openProjectButton} />
            </OpenProjectButton>
          </InfoFooter>

        </ProjectInfo>
      </ProjectContainer>
    );
  }
}

const mapStateToProps = () => createStructuredSelector({
  project: selectProject,
  images: selectProjectImages,
  tenantLogo: makeSelectCurrentTenantImm('attributes', 'logo', 'small'),
});

Project.propTypes = {
  project: ImPropTypes.map.isRequired,
  images: ImPropTypes.list,
  tenantLogo: PropTypes.string,
  goTo: PropTypes.func.isRequired,
};

export default preprocess(mapStateToProps, { goTo: push })(Project);
