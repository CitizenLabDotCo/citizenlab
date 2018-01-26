// Libs
import React from 'react';

// Utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// Components
import IdeaCards from 'components/IdeaCards';
import IdeasMap from 'components/IdeasMap';
import { Button } from 'semantic-ui-react';
import FeatureFlag from 'components/FeatureFlag';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styles
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 60px;
  margin-bottom: 30px;
`;

const ToggleWrapper = styled.div`
  margin-bottom: 20px;
  text-align: left;
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
    const display = this.state.display === 'map' ? 'cards' : 'map';

    trackEvent(tracks.toggleDisplay, { selectedDisplayMode: display });
    this.setState({ display });
  }

  render() {
    const { type, id } = this.props;
    const { display } = this.state;

    return (
      <Container>
          <FeatureFlag name="maps">
            <ToggleWrapper>
              <Button.Group size="small" toggle onClick={this.toggleDisplay}>
                <Button active={display === 'cards'}><FormattedMessage {...messages.displayCards} /></Button>
                <Button active={display === 'map'}><FormattedMessage {...messages.displayMap} /></Button>
              </Button.Group>
            </ToggleWrapper>
          </FeatureFlag>

          <FeatureFlag name="maps">
            {display === 'map' && type === 'project' &&
              <IdeasMap project={id} />
            }

            {display === 'map' && type === 'phase' &&
              <IdeasMap phase={id} />
            }
          </FeatureFlag>

          {display === 'cards' && type === 'project' &&
            <IdeaCards filter={{ project: id }} />
          }

          {display === 'cards' && type === 'phase' &&
            <IdeaCards filter={{ phase: id }} />
          }
      </Container>
    );
  }
}
