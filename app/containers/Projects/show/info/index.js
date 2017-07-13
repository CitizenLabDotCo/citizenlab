import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import T from 'containers/T';
import styled from 'styled-components';
import { Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { makeSelectTopics } from './selectors';
import { media } from 'utils/styleUtils';
import { Link } from 'react-router';

const Left = styled.section`
  width: 70%;
  flex: 3;
  ${media.phone`
    margin-bottom: 20px;
  `}
`;

const IdeaTitleStyled = styled.header`
  font-size: 30px;
  font-weight: bold;
  color: #000000;
  line-height: 1em;
`;

const IdeaBodyStyled = styled.div`
  margin-top: 45px; 
  font-size: 18px;
  line-height: 1.33;
  color: #777777;
`;

const Right = styled.aside`
  flex: 2;
`;

const AddIdeaButtonStyled = styled.button`
  background-color: ${(props) => props.theme.color.main};
  border-radius: 5px;
  width: 100%;
  height: 85px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 25px;
  
  > a {
    color: #ffffff !important;
  }
  
  ${media.phone`
    display: none;
  `}
`;

const ProjectImageStyled = styled(Image)`
  width: 100%;
  height: 435px;
`;

const ProjectSideLabel = styled.header`
  font-size: 16px;
  font-weight: bold;
  color: #233046;
  margin-top: 25px;
`;

const ProjectTopicsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 29px 0;
`;

const ProjectTopicStyled = styled.div`
  width: 150px;
  height: 49px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #5a5a5a;
  background-color: #eaeaea;
  border-radius: 5px;
  margin: 0 13px 0 12px;
  display: flex;
  align-items: center;
`;

const ProjectTopicIconStyled = styled(Image)`
  float: left;
  margin: 16px 10px;
  width: 23px;
  height: 23.8px;
`;

const ProjectsInfo = ({ project, className, params }) => (<div className={className}>
  {project && <Left>
    <IdeaTitleStyled>
      <T value={project.toJS().title_multiloc} />
    </IdeaTitleStyled>
    <IdeaBodyStyled>
      <T value={project.toJS().description_multiloc} />
    </IdeaBodyStyled>
  </Left>}
  {project && <Right>
    <AddIdeaButtonStyled>
      <Link to={`/ideas/new/${params.projectId}`}>
        <FormattedMessage {...messages.addIdea} />
      </Link>
    </AddIdeaButtonStyled>
    {project.image && <ProjectImageStyled src={project.toJS().image} />}
    <section>
      <ProjectSideLabel>
        <FormattedMessage {...messages.topics} />
      </ProjectSideLabel>
      <ProjectTopicsStyled>
        {project.topics && project.topics.toJS().map((topic) => (<article><ProjectTopicStyled>
          <ProjectTopicIconStyled src={topic.icon} />
          <T value={topic.title_multiloc} />
        </ProjectTopicStyled></article>))}
      </ProjectTopicsStyled>
    </section>
    <section>
      <ProjectSideLabel>
        <FormattedMessage {...messages.location} />
      </ProjectSideLabel>
      <article>
        TODO #later
      </article>
    </section>
  </Right>}
</div>);

ProjectsInfo.propTypes = {
  project: ImmutablePropTypes.map,
  className: PropTypes.string,
  params: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  project: (state, { params }) => state.getIn(['resources', 'projects', params.projectId, 'attributes']),
  topics: makeSelectTopics(),
});

export default connect(mapStateToProps)(styled(ProjectsInfo)`
  margin-top: 75px;
  display: flex;
  width: 85%;
  max-width: 900px;
  flex-direction: row;
  justify-content: space-between;
  
  ${media.phone`
    display: block;
  `}
`);
