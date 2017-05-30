import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { Card } from 'semantic-ui-react';
import IdeaCard from 'components/IdeaCard';
import selectIdeasIndexPageDomain from '../../selectors';

const IdeasCards = ({ ideas }) => (
  <Card.Group stackable>
    {ideas.map((id) => (
      <IdeaCard key={id} id={id} />
    ))}
  </Card.Group>
);

IdeasCards.propTypes = {
  ideas: PropTypes.any.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideas: selectIdeasIndexPageDomain('ideas'),
});


export default connect(mapStateToProps, null)(IdeasCards);
