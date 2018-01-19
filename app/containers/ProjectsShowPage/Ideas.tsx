// Libs
import React from 'react';

// Components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import IdeasMap from 'components/IdeasMap';
import { Button } from 'semantic-ui-react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styles
import styled from 'styled-components';
const StyledContentContainer = styled(ContentContainer)`
  margin-top: 30px;
`;

const ToggleWrapper = styled.div`
  margin-bottom: 1rem;
  text-align: right;
`;

// Typings
interface Props {
  type: 'project' | 'phase';
  id: string;
}

interface State {
  display: 'map' | 'cards';
}

export default class Ideas extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      display: 'cards',
    };
  }

  toggleDisplay = () => {
    this.setState({ display: this.state.display === 'map' ? 'cards' : 'map' });
  }

  render() {
    const { type, id } = this.props;
    const { display } = this.state;

    return (
      <StyledContentContainer>
        <ToggleWrapper>
          <Button.Group size="mini" toggle onClick={this.toggleDisplay}>
            <Button active={display === 'map'}><FormattedMessage {...messages.displayMap} /></Button>
            <Button active={display === 'cards'}><FormattedMessage {...messages.displayCards} /></Button>
          </Button.Group>
        </ToggleWrapper>

        {display === 'map' && type === 'project' && 
          <IdeasMap project={id} />
        }

        {display === 'map' && type === 'phase' && 
          <IdeasMap phase={id} />
        }

        {display === 'cards' && type === 'project' && 
          <IdeaCards filter={{ project: id }} />
        }

        {display === 'cards' && type === 'phase' && 
          <IdeaCards filter={{ phase: id }} />
        }
      </StyledContentContainer>
    );
  }
}
