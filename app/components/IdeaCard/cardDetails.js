/**
*
* IdeaCard
*
*/

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

const colors = [
  'red', 'orange', 'yellow', 'olive', 'green', 'teal',
  'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black',
];

class ResourceDetail extends React.PureComponent {
  render() {
    const { resource } = this.props;
    return (
      <Card.Description style={{ marginBottom: '5px' }}>
        {resource.map((item, i) => {
          const title = item.getIn(['data', 'title_multiloc']);
          if (!title) return <span key={i} />;
          return (
            <Label key={item.get('id')} color={colors[i]}>
              <T value={title.toJS()} />
            </Label>
          );
        })}
      </Card.Description>
    );
  }
}

ResourceDetail.propTypes = {
  resource: React.PropTypes.any,
  //type: React.PropTypes.any,
};

class CardDetails extends React.PureComponent {
  render() {
    const { data, type } = this.props;
    return (
      <Card style={{ margin: 0, borderRadius: 0, boxShadow: 'none' }}>
        <Card.Content>
          <Card.Description>
            <Feed.Label />
            <ResourceDetail resource={areas} type={'Areas'} />
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

CardDetails.propTypes = {
  author: React.PropTypes.any,
  topics: React.PropTypes.any,
  areas: React.PropTypes.any,
};

export { CardDetails, ResourceDetail, AuthorDetail };
