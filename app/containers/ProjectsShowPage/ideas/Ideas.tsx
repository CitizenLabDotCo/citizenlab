// Libs
import React from 'react';

// Utils
import { trackEvent } from 'utils/analytics';
import tracks from '../tracks';

// Components
import IdeaCards from 'components/IdeaCards';
import IdeasMap from 'components/IdeasMap';
import { Button } from 'semantic-ui-react';
import FeatureFlag from 'components/FeatureFlag';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Styles
import styled from 'styled-components';

const Container = styled.div``;

const ToggleWrapper = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

// Typings
interface Props {
  type: 'project' | 'phase';
  id: string;
  defaultDisplay: 'map' | 'card';
}

interface State {
  display: 'map' | 'card';
}

export default class Ideas extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      display: 'card',
    };
  }

  componentDidMount() {
    this.setState({ display: this.props.defaultDisplay });
  }

  toggleDisplay = () => {
    const display = this.state.display === 'map' ? 'card' : 'map';

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
                <Button active={display === 'card'}><FormattedMessage {...messages.displayCards} /></Button>
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

          {display === 'card' && type === 'project' &&
            <IdeaCards queryParameters={{ project: id }} />
          }

          {display === 'card' && type === 'phase' &&
            <IdeaCards queryParameters={{ phase: id }} />
          }
      </Container>
    );
  }
}
