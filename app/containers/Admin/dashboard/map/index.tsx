import React, { PureComponent } from 'react';
import styled from 'styled-components';

// Data loading
import GetGeotaggedIdeas, { GetGeotaggedIdeasChildProps } from 'resources/GetGeotaggedIdeas';
import { IGeotaggedIdeaData } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

// Components
import Spinner from 'components/UI/Spinner';
import MapComponent from 'components/Map';
import IdeaPane from './IdeaPane';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styles
const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
`;
const MapWrapper = styled.div`
  display: flex;
  align-items: stretch;
  height: 600px;
`;

const StyledMap = styled(MapComponent)`
  width: 100%;
  height: 600px;
`;

const Panel = styled.div`
  flex: 0 0 300px;
  height: 600px;
  margin-left: 20px;
`;

// typings
interface InputProps { }
interface DataProps {
  ideas: GetGeotaggedIdeasChildProps;
}
interface Props extends DataProps, InputProps { }

interface State {
  selectedIdeaId: string | null;
  panelOpened: boolean;
}

class Map extends PureComponent<Props & InjectedLocalized, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedIdeaId: null,
      panelOpened: false,
    };
  }

  getPoints = (ideas: IGeotaggedIdeaData[]) => {
    return ideas
      .filter(idea => idea.attributes.location_point_geojson)
      .map(idea => (
        {
          ...idea.attributes.location_point_geojson,
          id: idea.id,
          title: this.props.localize(idea.attributes.title_multiloc)
        }
      ));
  }

  toggleIdea = (id: string) => {
    this.setState(({ selectedIdeaId }) => {
      return { selectedIdeaId: (id !== selectedIdeaId ? id : null) };
    });
  }

  handleIdeaClick = (id: string) => {
    const { panelOpened, selectedIdeaId } = this.state;
    if (id === selectedIdeaId) {
      if (panelOpened) {
        this.setState({ selectedIdeaId: null });
      }
      this.setState({ panelOpened: !panelOpened });
    } else {
      trackEventByName(tracks.clickIdeaOnMap.name, { extra: { id } });
      this.setState({ selectedIdeaId: id });
      if (!panelOpened) {
        this.setState({ panelOpened: true });
      }
    }
  }
  closePanel = () => {
    this.setState({ panelOpened: false });
  }

  render() {
    const { ideas } = this.props;
    const { selectedIdeaId, panelOpened } = this.state;

    if (ideas === undefined) {
      return (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      );
    }
    if (isNilOrError(ideas)) return null;
    return (
      <div>
        <p>
          <FormattedMessage {...messages.mapHelperText} />
        </p>
        <MapWrapper>
          <StyledMap
            points={this.getPoints(ideas)}
            onMarkerClick={this.handleIdeaClick}
          />
          {panelOpened &&
            <Panel>
              {selectedIdeaId &&
                <IdeaPane
                  onClose={this.closePanel}
                  ideaId={selectedIdeaId}
                />
              }
            </Panel>
          }
        </MapWrapper>
      </div>
    );
  }
}

const MapWithLoc = injectLocalize(Map);

export default (inputProps: InputProps) => (
  <GetGeotaggedIdeas>
    {ideas => <MapWithLoc ideas={ideas} {...inputProps} />}
  </GetGeotaggedIdeas>
);
