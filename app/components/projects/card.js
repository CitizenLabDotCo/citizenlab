import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';

import styled from 'styled-components';
import T from 'containers/T';
import { media } from 'utils/styleUtils';
import projectImage from '../../../assets/img/landingpage/project1.png';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { push } from 'react-router-redux';

const ProjectContainer = styled.div`
  width: calc(50% - 10px);
  height: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background: #fff;
  cursor: pointer;
  margin-bottom: 20px;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;

  ${media.phone`
    width: 100%;
  `}

  ${media.tablet`
    width: 100%;
  `}

  ${media.desktop`
    &:nth-child(even) {
      margin-left: 20px;
    }
  `}

  &:hover {
    box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.2);
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.12), 0 15px 45px 0 rgba(0,0,0,0.12);
    transform: scale(1.01);
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 240px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-image: url(${projectImage});
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
`;

const ProjectContent = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 15px;
  padding-bottom: 20px;
`;

const ProjectTitle = styled.div`
  color: #444;
  font-size: 27px;
  font-weight: 300;
  line-height: 31px;
`;

const ProjectMeta = styled.div`
  display: flex;
  margin-top: 10px;
  margin-left: -6px;
  align-items: center;
`;

const ProjectMetaIcon = styled.svg`
  fill: #aaa;
  height: 22px;
  margin-top: -2px;
`;

class Project extends React.Component {
  render() {
    const { title, description, goTo, id } = this.props;
    return (
      <ProjectContainer onClick={() => goTo(`project/${id}`)}>
        <ProjectImage></ProjectImage>
        <ProjectContent>
          <ProjectTitle><T value={title} /></ProjectTitle>
          <ProjectTitle><T value={description} /></ProjectTitle>
          <ProjectMeta>
            <ProjectMetaIcon height="100%" viewBox="0 0 24 24">
              <defs><path d="M0 0h24v24H0V0z" id="a" /></defs><clipPath id="b"><use overflow="visible" /></clipPath><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
            </ProjectMetaIcon>
          </ProjectMeta>
        </ProjectContent>
      </ProjectContainer>
    );
  }
}

const mapStateToProps = () => createStructuredSelector({
  title: (state, { id }) => state.getIn(['resources', 'projects', id, 'attributes', 'title_multiloc']),
  description: (state, { id }) => state.getIn(['resources', 'projects', id, 'attributes', 'description_multiloc']),
});

Project.propTypes = {
  title: ImPropTypes.map.isRequired,
  description: ImPropTypes.map.isRequired,
  id: PropTypes.string,
  goTo: PropTypes.func.isRequired,
};

export default preprocess(mapStateToProps, { goTo: push })(Project);
