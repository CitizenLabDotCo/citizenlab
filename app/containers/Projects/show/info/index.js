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
  ${media.phone`
    margin-bottom: 20px;
  `}
`;

const IdeaTitleStyled = styled.header`
  // TODO
`;

const IdeaBodyStyled = styled.div`
  // TODO
`;

const Right = styled.aside`
  // TODO
`;

const AddIdeaButtonStyled = styled.button`
  // TODO
`;

const ProjectImageStyled = styled(Image)`
  // TODO
`;

const ProjectSideLabel = styled.header`
  // TODO
`;

const ProjectTopicStyled = styled.div`
  // TODO
`;


const ProjectsInfo = ({ title, description, image, topics, className }) => (<div className={className}>
  <Left>
    <IdeaTitleStyled>
      <T value={title} />
    </IdeaTitleStyled>
    <IdeaBodyStyled>
      <T value={description} />
    </IdeaBodyStyled>
  </Left>
  <Right>
    <AddIdeaButtonStyled>
      <Link>
        <FormattedMessage {...messages.addIdea} />
      </Link>
    </AddIdeaButtonStyled>
    <ProjectImageStyled src={image} />
    <section>
      <ProjectSideLabel>
        <FormattedMessage {...messages.topics} />
      </ProjectSideLabel>
      {topics && topics.toJS().map((topic) => (<article><ProjectTopicStyled>
        <T value={topic.title_mutltiloc} />
      </ProjectTopicStyled></article>))}
    </section>
    <section>
      <ProjectSideLabel>
        <FormattedMessage {...messages.location} />
      </ProjectSideLabel>
      <article>
        TODO
      </article>
    </section>
  </Right>
</div>);

ProjectsInfo.propTypes = {
  description: ImmutablePropTypes.map,
  title: ImmutablePropTypes.map,
  topics: ImmutablePropTypes.list,
  image: PropTypes.string,
  className: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  title: (state, { params }) => state.getIn(['resources', 'projects', params.projectId, 'attributes', 'title_multiloc']),
  description: (state, { params }) => state.getIn(['resources', 'projects', params.projectId, 'attributes', 'description_multiloc']),
  image: (state, { params }) => state.getIn(['resources', 'projects', params.projectId, 'attributes', 'cover_image']),
  topics: makeSelectTopics(),
});

export default connect(mapStateToProps)(styled(ProjectsInfo)`
  display: flex;
  width: 75%;
  max-width: 900px;
  flex-direction: row;
  justify-content: space-between;
  
  ${media.phone`
    display: block;
  `}
`);
