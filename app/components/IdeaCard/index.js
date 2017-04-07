/**
*
* IdeaCard
*
*/

import React, { PropTypes } from 'react';
import T from 'containers/T';
import { Card, Image, Button, Icon, Label } from 'semantic-ui-react';
import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';
// import messages from './messages';

class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { idea } = this.props;

    return (
      <Card>
        <Image
          scr={idea.attributes.images[0] && idea.attributes.images[0].medium}
          label={parseInt(idea.id.match(/\d+/), 10) % 5 === 0 ? { as: 'a', corner: 'right', icon: 'university' } : false}
        />
        <Card.Content>
          <Card.Header>
            <T value={idea.attributes.title_multiloc} />
          </Card.Header>
          <Card.Description>
            <Label as="a">
              <Icon name="music"></Icon>
              Culture
            </Label>
          </Card.Description>
        </Card.Content>
        <Button.Group basic attached="bottom" size="small">
          <Button>
            <Icon color="green" name="thumbs outline up" />
          </Button>
          <Button.Or text="125"></Button.Or>
          <Button>
            <Icon color="red" name="thumbs outline down" />
          </Button>
        </Button.Group>
      </Card>
    );
    // TODO enable eslint
    /* eslint-disable */
    // fix: Visible, non-interactive elements should not have mouse or keyboard event listeners
    // return (
    //   <div className={'card ' + this.props.className} onClick={this.props.onClick}>
    //     <div className="card-section">
    //       {!_.isEmpty(idea.attributes.images) && <img src={idea.attributes.images[0].medium} role="presentation"></img>}
    //       <h4>
    //         <T value={idea.attributes.title_multiloc}></T>
    //       </h4>
    //       <p>
    //
    //       </p>
    //     </div>
    //   </div>
    // );
  }
}

IdeaCard.propTypes = {
  idea: PropTypes.object,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default styled(IdeaCard)`
  cursor: pointer;
`;
