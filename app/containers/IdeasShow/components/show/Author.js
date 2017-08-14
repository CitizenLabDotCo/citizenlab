import React from 'react';
import { FormattedRelative, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { Link } from 'react-router';

import { preprocess } from 'utils';

// import IdeaContent from '../IdeaContent';
import { selectResourcesDomain } from 'utils/resources/selectors';
import messages from '../../messages';

const AuthorContainer = styled.div`
  display: flex;
`;

const Avatar = styled.img`
  flex: 0 0 38px;
  height: 38px;
  border-radius: 50%;
`;

const Meta = styled.div`
  flex: 1;
  flex-direction: column;
  padding 0 12px;
`;

const AuthorName = styled(Link)`
  font-weight: bold;
  color: #484848;
  font-size: 16px;
`;

const Timing = styled.div`
  font-size: 14px;
  color: #a9a9a9;
`;

/* eslint-disable */
const Author = ({id, firstName, lastName, avatar, createdAt}) => (
  <AuthorContainer>
    <Avatar src={avatar} />
    <Meta>
      <AuthorName to={`/profile/${id}`}>
        <FormattedMessage {...messages.byAuthor} values={{ firstName, lastName }} />
      </AuthorName>
      <Timing>
        <FormattedRelative value={createdAt} />
      </Timing>
    </Meta>
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
  const { createdAt } = ownProps;
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
  };

};


export default preprocess(mapStateToProps, null, mergeProps)(Author)
