
import React from 'react';
import T from 'containers/T';
import { Card, Label, Feed } from 'semantic-ui-react';
import messages from './messages';

class AuthorDetail extends React.PureComponent {
  authorsName = (author) => {
    if (!author) return '';
    const last = author && author.get('last_name');
    const first = author && author.get('last_name');
    return [last, first].filter((name) => name).join(', ');
  }

  render() {
    const { author } = this.props;
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

AuthorDetail.propTypes = {
  author: React.PropTypes.any,
};

mapStateToProps = () => {
  
}