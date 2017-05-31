import React from 'react';
import PropTypes from 'prop-types';
import { Card as LayoutCard, Button, Image } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import T from 'containers/T';

import { selectResourcesDomain } from 'utils/resources/selectors';
import Author from './card/author';
// import Tags from './card/tags';

const Card = ({ header, images, label, labelObj, authorId, viewIdea, votes }) => {
  if (!header) return null;

  return (
    <LayoutCard>
      <Image
        onClick={viewIdea}
        src={images}
        style={{ cursor: 'pointer' }}
        label={label && labelObj}
      />

      <LayoutCard.Content style={{ cursor: 'pointer' }}>
        <LayoutCard.Header onClick={viewIdea} >
          <T value={header} />
        </LayoutCard.Header>
        <Author authorId={authorId} />
      </LayoutCard.Content>

      {/*
      <Tags tags={areasData} type={'areas'} />
      <Tags tags={topicsData} type={'topics'} />
      */}

      <LayoutCard.Content extra>
        <div className="ui two buttons">
          <Button basic color="green">{votes}</Button>
          <Button basic color="red">{votes}</Button>
        </div>
      </LayoutCard.Content>

      {/*
      <Button.Group basic attached={'bottom'} size={'small'}>
        <Button>
        </Button>
        <Button.Or text={votes} />
        <Button>
        </Button>
      </Button.Group>
      */}
    </LayoutCard>
  );
};

Card.propTypes = {
  images: PropTypes.string,
  label: PropTypes.bool,
  labelObj: PropTypes.object,
  header: PropTypes.any,
  authorId: PropTypes.any,
  viewIdea: PropTypes.any,
  votes: PropTypes.number,
  project: PropTypes.string,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { id }) => selectResourcesDomain('ideas', id)(state),
  location: (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),

});

const mapDispatchToProps = (dispatch) => bindActionCreators({ push }, dispatch);
const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { id, project } = ownProps;
  const { idea, location } = stateProps;
  if (!idea) return {};

  const attributes = idea.get('attributes');

  const images = attributes.getIn(['images', '0', 'medium']);
  const label = parseInt(id.match(/\d+/), 10) % 5 === 0;
  const labelObj = { as: 'a', corner: 'right', icon: 'university' };
  const votes = attributes.get('downvotes_count') + attributes.get('upvotes_count');
  const header = attributes.get('title_multiloc');

  const relationships = idea.get('relationships');
  const authorId = relationships.getIn(['author', 'data', 'id']);
  const topicsData = relationships.getIn(['topics', 'data']);
  const areasData = relationships.getIn(['areas', 'data']);
  const changePage = dispatchProps.push;
  const viewIdea = () => changePage(project
    ? `projects/${project}/${id}`
    : `${location}/${id}`);
  return {
    header,
    images,
    label,
    labelObj,
    authorId,
    topicsData,
    areasData,
    viewIdea,
    votes,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Card);
