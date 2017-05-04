import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { Grid } from 'semantic-ui-react';
import IdeaCard from 'components/IdeaCard';
import selectIdeasIndexPageDomain from '../../selectors';

const { Column, Row } = Grid;

const IdeasCards = ({ ideas }) => (
  <Row>
    {ideas.map((id) => (
      <Column key={id} style={{ paddingTop: '0', paddingBottom: '10px' }}>
        <IdeaCard id={id} />
      </Column>
    ))}
  </Row>
);

IdeasCards.propTypes = {
  ideas: PropTypes.any.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideas: selectIdeasIndexPageDomain('ideas'),
});


export default connect(mapStateToProps, null)(IdeasCards);
