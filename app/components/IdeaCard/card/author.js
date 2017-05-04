
import React from 'react';
import T from 'containers/T';
import { Card } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

import messages from '../messages';

const Author = ({ fullName }) => {
  if (!fullName) return null;
  return (
    <Card.Meta style={{ lineHeight: '2em' }}>
      <div>
        <b style={{ color: 'rgba(0, 0, 0, 0.68)' }}>
          <T value={messages.author} />:
        </b>
        <span />
        {fullName}
      </div>
    </Card.Meta>
  );
};

Author.propTypes = {
  fullName: PropTypes.string.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  user: (state, { authorId }) => selectResourcesDomain('users', authorId)(state),
});

const mergeProps = ({ user }, dispatchProps, ownProps) => {
  if (!user) return {};

  const author = user.get('attributes');
  const last = author.get('last_name');
  const first = author.get('last_name');
  const fullName = [last, first].filter((name) => name).join(', ');
  return { fullName, ...ownProps };
};

export default connect(mapStateToProps, null, mergeProps)(Author);