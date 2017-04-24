/**
*
* IdeaCard
*
*/

import React, { PropTypes } from 'react';
import T from 'containers/T';
import styled from 'styled-components';
import { Card, Label, Button, Image, Icon } from 'semantic-ui-react';

// import { FormattedMessage } from 'react-intl';
// import messages from './messages';

class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { idea } = this.props;
    const { author, topics, areas } = idea.relationships;
    // TODO enable eslint
    /* eslint-disable */
    // fix: Visible, non-interactive elements should not have mouse or keyboard event listeners
    return (
      <Card>
        <Image
          onClick={this.props.onClick}
          src={idea.attributes.images[0] && idea.attributes.images[0].medium}
          style={ {cursor: "pointer"} }
          label={parseInt(idea.id.match(/\d+/), 10) % 5 === 0 ? { as: 'a', corner: 'right', icon: 'university' } : false}
        />
        <Card.Content
          onClick={this.props.onClick}
          src={idea.attributes.images[0] && idea.attributes.images[0].medium}
          style = {{cursor: "pointer"}}
        >
          <Card.Header>
            <T value={idea.attributes.title_multiloc} />
          </Card.Header>
          <Card.Description>
            <Label as="a">
              <Icon name="music"></Icon>
              Culture
            </Label>

            {author.attributes.first_name}
            {topics.data.map((topic) =>
              {topic && topic.attributes && <T key={topic.id} value={topic.attributes.title_multiloc}></T>}
            )}
            {areas.data.map((area) =>
              {area && area.attributes && <T key={area.id} value={area.attributes.title_multiloc}></T>}
            )}

          </Card.Description>
        </Card.Content>
        <Button.Group basic attached="bottom" size="small">
          <Button>
            <Icon color="green" name="thumbs outline up" />
          </Button>
          <Button.Or text="125"/>
          <Button>
            <Icon color="red" name="thumbs outline down" />
          </Button>
        </Button.Group>
      </Card>
    );
  }
}

IdeaCard.propTypes = {
  idea: PropTypes.object,
  onClick: PropTypes.func.required,
  className: PropTypes.string,
};

export default styled(IdeaCard)`
  cursor: pointer;
`;
