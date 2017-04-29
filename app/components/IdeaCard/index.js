/**
*
* IdeaCard
*
*/

import React, { PropTypes } from 'react';
import T from 'containers/T';
import { Card, Label, Button, Image, Icon, Feed } from 'semantic-ui-react';

const AuthorDetail = (props) => {
  const { author } = props;
  const last = author && author.get('last_name');
  const first = author && author.get('last_name');
  const nameString = [last, first].filter((name) => name).join(', ');
  return (
    <Card.Content>
      <Card.Description>
          Author: {nameString}
      </Card.Description>
    </Card.Content>
  );
};

AuthorDetail.propTypes = {
  author: React.PropTypes.any,
};

const ResourceDetail = (props) => {
  const { resource, type } = props;

  return (
    <Card.Content>
      <Card.Description>
        <b>{type} </b>: <span></span>
        {resource.map((item, i) => {
          const title = item.getIn(['data', 'title_multiloc']);
          if (!title) return <span key={i} />;
          return (
            <span key={item.get('id')}>
              <T value={title.toJS()} />
            </span>
          );
        })}
      </Card.Description>
    </Card.Content>
  );
};

ResourceDetail.propTypes = {
  resource: React.PropTypes.any,
  type: React.PropTypes.any,
};

class CardDetails extends React.PureComponent {
  render() {
    const { author, topics, areas } = this.props;
    return (
      <Card style={{ margin: 0, borderRadius: 0, boxShadow: 'none' }}>
        <Card.Content>
          <Card.Description>
            <AuthorDetail author={author} />
          </Card.Description>
        </Card.Content>

        <Card.Content>
          <Card.Description>
            <Feed.Label />
            <ResourceDetail resource={topics} type={'Topics'} />
          </Card.Description>
        </Card.Content>

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
  author: PropTypes.any,
  topics: PropTypes.any,
  areas: PropTypes.any,
};

class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { idea, id, onClick } = this.props;
    const images = idea.getIn(['images', '0', 'medium']);
    const label = parseInt(id.match(/\d+/), 10) % 5 === 0 ? { as: 'a', corner: 'right', icon: 'university' } : false;
    const header = idea.get('title_multiloc').toJS();
    return (
      <Card style={{ height: '100%' }}>
        <Image
          onClick={onClick}
          src={images}
          style={{ cursor: 'pointer' }}
          label={label}
        />
        <Card.Content style={{ cursor: 'pointer' }}>
          <Card.Header onClick={onClick} >
            <T value={header} />
          </Card.Header>
          <Card.Description>
            <Label as={'a'}>
              <Icon name={'music'} />
              Culture
            </Label>
          </Card.Description>
        </Card.Content>
        {this.props.children}
        <Button.Group basic attached={'bottom'} size={'small'}>
          <Button>
            <Icon color={'green'} name={'thumbs outline up'} />
          </Button>
          <Button.Or text={'125'} />
          <Button>
            <Icon color={'red'} name={'thumbs outline down'} />
          </Button>
        </Button.Group>
      </Card>
    );
  }
}

IdeaCard.propTypes = {
  idea: PropTypes.any,
  id: PropTypes.string,
  children: PropTypes.element,
  onClick: PropTypes.func,
};

export default IdeaCard;
export { CardDetails };

// export default styled(IdeaCard)`
//   cursor: pointer;
// `;
