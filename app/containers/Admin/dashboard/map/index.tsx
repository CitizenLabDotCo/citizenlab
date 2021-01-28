import React, { PureComponent } from 'react';
import styled from 'styled-components';

// Data loading
import GetGeotaggedIdeas, {
  GetGeotaggedIdeasChildProps,
} from 'resources/GetGeotaggedIdeas';
import { IGeotaggedIdeaData } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

// Components
import { Spinner } from 'cl2-component-library';
import Map from 'components/Map';
import IdeaPane from './IdeaPane';
import Warning from 'components/UI/Warning';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { colors } from 'utils/styleUtils';
import ServerError from 'components/admin/ServerError';

// styles
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  & > :not(:last-child) {
    margin-bottom: 10px;
  }
  color: ${colors.adminSecondaryTextColor};
  align-items: center;
  justify-content: center;
  height: 600px;
`;

const Placeholder = styled.span`
  height: 19px;
`;

const MapWrapper = styled.div`
  display: flex;
  align-items: stretch;
  height: 600px;
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 30px;
`;

const StyledMap = styled(Map)`
  width: 100%;
`;
const Panel = styled.div`
  flex: 0 0 300px;
  height: 600px;
  margin-left: 20px;
`;

// typings
interface InputProps {}
interface DataProps {
  ideas: GetGeotaggedIdeasChildProps;
}
interface Props extends DataProps, InputProps {}

interface State {
  selectedIdeaId: string | null;
  panelOpened: boolean;
  loadingMessage: JSX.Element | null;
}

class DashboardMap extends PureComponent<Props & InjectedLocalized, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedIdeaId: null,
      panelOpened: false,
      loadingMessage: null,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loadingMessage: (
          <FormattedMessage {...messages.automaticLoadingMessage} />
        ),
      });
      setTimeout(() => {
        this.setState({
          loadingMessage: <FormattedMessage {...messages.thenLoadingMessage} />,
        });
        setTimeout(() => {
          this.setState({
            loadingMessage: (
              <FormattedMessage {...messages.lastLoadingMessage} />
            ),
          });
        }, 30000);
      }, 30000);
    }, 2000);
  }

  getPoints = (ideas: IGeotaggedIdeaData[]) => {
    return ideas
      .filter((idea) => idea.attributes.location_point_geojson)
      .map((idea) => ({
        ...idea.attributes.location_point_geojson,
        id: idea.id,
        title: this.props.localize(idea.attributes.title_multiloc),
      }));
  };

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
  };
  closePanel = () => {
    this.setState({ panelOpened: false });
  };

  render() {
    const { ideas } = this.props;
    const { selectedIdeaId, panelOpened } = this.state;

    if (ideas === undefined) {
      return (
        <SpinnerContainer>
          <Spinner />
          {this.state.loadingMessage || <Placeholder />}
        </SpinnerContainer>
      );
    }
    if (isNilOrError(ideas)) {
      return <ServerError />;
    }
    return (
      <div>
        <StyledWarning
          text={<FormattedMessage {...messages.mapExplanationText} />}
        />
        <MapWrapper>
          <StyledMap
            points={this.getPoints(ideas)}
            onMarkerClick={this.handleIdeaClick}
            mapHeight={600}
          />
          {panelOpened && (
            <Panel>
              {selectedIdeaId && (
                <IdeaPane onClose={this.closePanel} ideaId={selectedIdeaId} />
              )}
            </Panel>
          )}
        </MapWrapper>
      </div>
    );
  }
}

const DashboardMapMapWithLoc = injectLocalize(DashboardMap);

export default (inputProps: InputProps) => (
  <GetGeotaggedIdeas>
    {(ideas) => <DashboardMapMapWithLoc ideas={ideas} {...inputProps} />}
  </GetGeotaggedIdeas>
);
