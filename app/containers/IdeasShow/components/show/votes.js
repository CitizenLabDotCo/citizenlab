import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { Button, Icon } from 'semantic-ui-react'

import { preprocess } from 'utils';

// import IdeaContent from '../IdeaContent';
import { selectResourcesDomain } from 'utils/resources/selectors';


/* eslint-disable */
const Votes = ({ votes, upVote, downVote }) => (
  <Button.Group>
    <Button basic color='red' onClick={downVote}>
      <Icon name='thumbs outline down' />
    </Button>
    <Button.Or text={votes}/>
    <Button basic color='green' onClick={upVote}>
      <Icon name='thumbs outline up' />
    </Button>
  </Button.Group>
);

Votes.propTypes = {
  count: PropTypes.number,
  upVote: PropTypes.func,
  downVote: PropTypes.func,
  children: PropTypes.any,
};


const mapStateToProps = createStructuredSelector({
  currentTenant: makeSelectCurrentTenant(),
  currentUser: makeSelectCurrentUser(),
});

  currentUser: PropTypes.object,


export default Votes;