import React from 'react';
import { FormattedRelative, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { Link } from 'react-router';

import { preprocess } from 'utils';

// import IdeaContent from '../IdeaContent';
import { selectResourcesDomain } from 'utils/resources/selectors';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  flex: 0 0 38px;
  height: 38px;
  border-radius: 50%;
`;

const AuthorName = styled(Link)`
  font-weight: bold;
  color: #484848;
  font-size: 16px;
  flex-grow: 1;
  padding-left: 12px;
`;

const Timing = styled.div`
  font-size: 14px;
  color: #a9a9a9;
`;

/* eslint-disable */
const Author = ({id, slug, firstName, lastName, avatar, createdAt, message}) => (
  <AuthorContainer>
    <Avatar src={avatar} />
    <AuthorName to={`/profile/${slug}`}>
      <FormattedMessage {...message} values={{ firstName, lastName }} />
    </AuthorName>
    <Timing>
      <FormattedRelative value={createdAt} />
    </Timing>
  </AuthorContainer>
);

Author.propTypes = {
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  avatar: PropTypes.string,
  createdAt: PropTypes.any,
};

const mapStateToProps = () => createStructuredSelector({
  user: (state, { authorId }) => selectResourcesDomain('users', authorId)(state),
});

const mergeProps = ({ user }, dispatchProps, ownProps) => {
  const { createdAt, message } = ownProps;
  if (!user) return {}
  const attributes = user.get('attributes');
  const id = user.get('id');
  const slug = attributes.get('slug');
  const firstName = attributes.get('first_name');
  const lastName = attributes.get('last_name');
  const avatar = attributes.getIn(['avatar', 'small']);

  return {
    id,
    slug,
    avatar,
    firstName,
    lastName,
    lastName,
    createdAt,
    message,
  };

};


export default preprocess(mapStateToProps, null, mergeProps)(Author)
