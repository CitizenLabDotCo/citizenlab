import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import T from 'containers/T';
import styled from 'styled-components';
// import { FormattedMessage } from 'react-intl';
import ContentContainer from 'components/ContentContainer';
// import messages from './messages';
import { selectProjectImages } from './selectors';
import { media } from 'utils/styleUtils';
// import { Link } from 'react-router';


const Container = styled.div`
  margin-top: 75px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${media.phone`
    display: block;
  `}
`;

const Left = styled.section`
  flex: 3;
  ${media.phone`
    margin-bottom: 20px;
  `}
  ${media.notPhone`
    padding-right: 30px;
  `}
`;

const IdeaTitleStyled = styled.header`
  font-size: 30px;
  font-weight: 600;
  line-height: 36px;
  color: #333;
`;

const IdeaBodyStyled = styled.div`
  margin-top: 45px;
  font-size: 18px;
  color: #777777;
`;

const Right = styled.aside`
  flex: 2;
  max-width: 400px;
  ${media.phone`
    display: none;
  `}
`;

// const AddIdeaButtonStyled = styled.button`
//   background-color: ${(props) => props.theme.colorMain};
//   border-radius: 5px;
//   width: 100%;
//   height: 85px;
//   text-align: center;
//   font-size: 20px;
//   font-weight: bold;
//   margin-bottom: 25px;

//   > a {
//     color: #ffffff !important;
//   }

//   ${media.phone`
//     display: none;
//   `}
// `;

const ProjectImages = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
`;

const ProjectImage = styled.img`

  margin: 5px;
  border-radius: 5px;

  &:first-child {
    width: 100%;
  }

  &:not(:first-child) {
    width: calc(33% - 9px);
  }

`;

// const ProjectSideLabel = styled.header`
//   font-size: 16px;
//   font-weight: bold;
//   color: #233046;
//   margin-top: 25px;
// `;

// const ProjectTopicsStyled = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin: 29px 0;
// `;

// const ProjectTopicStyled = styled.div`
//   width: 150px;
//   height: 49px;
//   text-align: right;
//   font-size: 16px;
//   font-weight: bold;
//   color: #5a5a5a;
//   background-color: #eaeaea;
//   border-radius: 5px;
//   margin: 0 13px 0 12px;
//   display: flex;
//   align-items: center;
// `;

// const ProjectTopicIconStyled = styled(Image)`
//   float: left;
//   margin: 16px 10px;
//   width: 23px;
//   height: 23.8px;
// `;

const ProjectsInfo = ({ project, images, className }) => {
  if (!project) return null;

  const title = project.getIn(['attributes', 'title_multiloc']);
  const description = project.getIn(['attributes', 'description_multiloc']);

  return (
    <ContentContainer>
      <Container className={className}>
        <Left>
          <IdeaTitleStyled>
            <T value={title} />
          </IdeaTitleStyled>
          <IdeaBodyStyled>
            <T value={description} />
          </IdeaBodyStyled>
        </Left>
        <Right>
          {/*
          <AddIdeaButtonStyled>
            <Link to={`/ideas/new/${params.projectId}`}>
              <FormattedMessage {...messages.addIdea} />
            </Link>
          </AddIdeaButtonStyled>
          */}
          <ProjectImages>
            {images && images.map((image) => (
              <ProjectImage key={image.get('id')} src={image.getIn(['attributes', 'versions', 'medium'])} />
            ))}
          </ProjectImages>
          {/* <section>
            <ProjectSideLabel>
              <FormattedMessage {...messages.topics} />
            </ProjectSideLabel>
            <ProjectTopicsStyled>
              {topics && topics.map((topic) => (<article><ProjectTopicStyled>
                <ProjectTopicIconStyled src={topic.icon} />
                <T value={topic.title_multiloc} />
              </ProjectTopicStyled></article>))}
            </ProjectTopicsStyled>
          </section> */}
        </Right>
      </Container>
    </ContentContainer>
  );
};

ProjectsInfo.propTypes = {
  project: ImmutablePropTypes.map.isRequired,
  // topics: ImmutablePropTypes.list,
  images: ImmutablePropTypes.list,
  className: PropTypes.string,
  params: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  // topics: makeSelectTopics(),
  images: selectProjectImages,
});

export default connect(mapStateToProps)(ProjectsInfo);
