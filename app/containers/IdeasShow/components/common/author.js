import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { Comment } from 'semantic-ui-react'
import moment from 'moment';

import { preprocess } from 'utils';

// import IdeaContent from '../IdeaContent';
import { selectResourcesDomain } from 'utils/resources/selectors';

/* eslint-disable */
const Author = ({firstName, lastName, avatar, createdAt}) => (
    <div>
      <Comment.Avatar src={avatar} />
      <Comment.Content style = {{ marginLeft: '40px' }}>
        <Comment.Author >
          <span>{firstName}</span> <span>{lastName}</span>
        </Comment.Author>
        <Comment.Text>
          {createdAt}
        </Comment.Text>
      </Comment.Content>
    </div>
);

Author.propTypes = {
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  avatar: PropTypes.string,
  children: PropTypes.any,
};

const mapStateToProps = () => createStructuredSelector({
  user: (state, { authorId }) => selectResourcesDomain('users', authorId)(state),
});

const mergeProps = ({ user }, dispatchProps, ownProps) => {
  const { children } = ownProps;
  if (!user) return {}
  const attributes = user.get('attributes');
  const firstName = attributes.get('first_name');
  const lastName = attributes.get('last_name');
  const avatar = attributes.getIn(['avatar', 'small']);

  const createdAt = moment(children).fromNow();
  return {
    avatar,
    firstName,
    lastName,
    lastName,
    createdAt,
  };

};


export default preprocess(mapStateToProps, null, mergeProps)(Author);