import React from 'react';
import { Card as LayoutCard, Button, Icon, Image } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect'

import T from 'containers/T';
import { selectResourcesDomain } from 'utils/resources/selectors';

import Author from './card/author'
import Tags from './card/tags'
class Card extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  handleClick = () => {
    const { onClick, id } = this.props;
    onClick(id);
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {
    console.log('render')
    const { id, ideas } = this.props;
    if (!ideas) return null;
    const idea = ideas.get(id);
    const attributes = idea.get('attributes');
    const images = attributes.getIn(['images', '0', 'medium']);
    const label = parseInt(id.match(/\d+/), 10) % 5 === 0 ? { as: 'a', corner: 'right', icon: 'university' } : false;
    const header = attributes.get('title_multiloc').toJS();

    const relationships = idea.get('relationships');
    const authorId = relationships.getIn(['author', 'data', 'id']);
    const topicsData = relationships.getIn(['topics', 'data']);
    const areasData = relationships.getIn(['areas', 'data']);

    return (
      <LayoutCard style={{ height: '100%' }}>
        <Image
          onClick={this.handleClick}
          src={images}
          style={{ cursor: 'pointer' }}
          label={label}
        />

        <LayoutCard.Content style={{ cursor: 'pointer' }}>
          <LayoutCard.Header onClick={this.handleClick} >
            <T value={header} />
          </LayoutCard.Header>
          <Author authorId={authorId} />
        </LayoutCard.Content>

          <Tags tagsData={areasData} />
          <Tags tagsData={topicsData} />
        <Button.Group basic attached={'bottom'} size={'small'}>
          <Button>
            <Icon color={'green'} name={'thumbs outline up'} />
          </Button>
          <Button.Or text={'125'} />
          <Button>
            <Icon color={'red'} name={'thumbs outline down'} />
          </Button>
        </Button.Group>
      </LayoutCard>
    );
  }
}

Card.propTypes = {
  ideas: React.PropTypes.any,
  id: React.PropTypes.string,
  children: React.PropTypes.any,
  onClick: React.PropTypes.func,
};

const mapStateToProps = createStructuredSelector({ ideas: selectResourcesDomain('ideas') });

export default connect(mapStateToProps)(Card);
