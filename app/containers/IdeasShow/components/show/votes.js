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

// const mapStateToProps = () => createStructuredSelector({
//   user: (state, { authorId }) => selectResourcesDomain('users', authorId)(state),
// });

// const mapStateToProps = () => createStructuredSelector({
//   user: (state, { authorId }) => selectResourcesDomain('users', authorId)(state),
// });

// const mergeProps = ({ user }, dispatchProps, ownProps) => {
//   const { children } = ownProps;
//   if (!user) return {}
//   const attributes = user.get('attributes');
//   const firstName = attributes.get('first_name');
//   const lastName = attributes.get('last_name');
//   const avatar = attributes.getIn(['avatar', 'small'])

//   return {
//     avatar,
//     firstName,
//     lastName,
//     lastName,
//     children,
//   };

// };

// preprocess(mapStateToProps, null, mergeProps)(
export default Votes;