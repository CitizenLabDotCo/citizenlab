import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { List, Image } from 'semantic-ui-react';

import { preprocess } from 'utils';

// import IdeaContent from '../IdeaContent';
import { selectResourcesDomain } from 'utils/resources/selectors';


/* eslint-disable */
const Author = ({firstName, lastName, avatar, children}) => (
  <List>
    <List.Item>
      <Image avatar src={avatar} />
      <List.Content>
        <List.Header as='a'>
          <span>{firstName}</span> <span>{lastName}</span>
        </List.Header>
        <List.Description>
          {children}
        </List.Description>
      </List.Content>
    </List.Item>
  </List>
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
  const avatar = attributes.getIn(['avatar', 'small'])

  return {
    avatar,
    firstName,
    lastName,
    lastName,
    children,
  };

};


export default preprocess(mapStateToProps, null, mergeProps)(Author)
