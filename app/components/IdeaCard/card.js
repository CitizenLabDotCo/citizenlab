import React from 'react';
import T from 'containers/T';
import { Card, Button, Icon, Image } from 'semantic-ui-react';


class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  handleClick = () => {
    const { onClick, id } = this.props;
    onClick(id);
  }
  // shouldComponentUpdate() {
  //   return false
  // }

  render() {
    const { idea, id } = this.props;
    const images = idea.getIn(['images', '0', 'medium']);
    const label = parseInt(id.match(/\d+/), 10) % 5 === 0 ? { as: 'a', corner: 'right', icon: 'university' } : false;
    const header = idea.get('title_multiloc').toJS();
    return (
      <Card style={{ height: '100%' }}>
        <Image
          onClick={this.handleClick}
          src={images}
          style={{ cursor: 'pointer' }}
          label={label}
        />

        <Card.Content style={{ cursor: 'pointer' }}>
          <Card.Header onClick={this.handleClick} >
            <T value={header} />
          </Card.Header>
          {this.props.children}
        </Card.Content>
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
  idea: React.PropTypes.any,
  id: React.PropTypes.string,
  children: React.PropTypes.any,
  onClick: React.PropTypes.func,
};

export default IdeaCard