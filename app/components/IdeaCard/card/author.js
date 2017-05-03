
import React from 'react';
import T from 'containers/T';
import { Card } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import messages from '../messages';
import { selectResourcesDomain } from 'utils/resources/selectors';


class Author extends React.PureComponent {
  authorsName = (author) => {
    if (!author) return '';
    const last = author && author.get('last_name');
    const first = author && author.get('last_name');
    return [last, first].filter((name) => name).join(', ');
  }

  render() {
    const { authorId, users } = this.props;
    if (!users) return null

    const author = users.getIn([authorId, 'attributes']);
    return (
      <Card.Meta style={{ lineHeight: '2em' }}>
        <div>
          <b style={{ color: 'rgba(0, 0, 0, 0.68)' }}>
            <T value={messages.author} />:
          </b>
          <span />
          {this.authorsName(author)}
        </div>
      </Card.Meta>
    );
  }
}

Author.propTypes = {
  authorId: PropTypes.string.isRequired,
  users: PropTypes.any,
};

const mapStateToProps = createStructuredSelector({
  users: selectResourcesDomain('users'),
});

export default connect(mapStateToProps)(Author);
