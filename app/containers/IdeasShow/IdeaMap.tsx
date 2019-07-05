import React, { PureComponent } from 'react';

// components
import Map from 'components/Map';
import Icon from 'components/UI/Icon';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  border: 1px solid ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const LocationLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 6px;
  line-height: normal;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.small}px;
  `}
`;

const LocationIcon = styled(Icon)`
  flex: 0 0 16px;
  width: 16px;
  height: 23px;
  fill: ${colors.label};
  margin-right: 13px;

  ${media.smallerThanMinTablet`
    flex: 0 0 14px;
    width: 14px;
    height: 20px;
  `}
`;

const LocationButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding-left: 18px;
  padding-right: 20px;
  padding-top: 10px;
  padding-bottom: 10px;

  &:hover {
    ${LocationLabel} {
      color: ${darken(0.2, colors.label)};
    }

    ${LocationIcon} {
      fill: ${darken(0.2, colors.label)};
    }
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
`;

const ArrowIcon = styled(Icon)`
  flex: 0 0 13px;
  width: 13px;
  height: 13px;
  fill: ${colors.label};
  transform: rotate(90deg);
  transition: all .2s linear;

  &.open {
    transform: rotate(0deg);
  }
`;

const MapWrapper = styled.div`
  border: 1px solid ${colors.separation};
  height: 265px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  margin: 20px 20px 0;

  &.map-enter {
    height: 0;
    opacity: 0;

    &.map-enter-active {
      height: 265px;
      opacity: 1;
      transition: all 250ms ease-out;
    }
  }

  &.map-exit {
    height: 265px;
    opacity: 1;

    &.map-exit-active {
      height: 0;
      opacity: 0;
      transition: all 250ms ease-out;
    }
  }
`;

const MapPaddingBottom = styled.div`
  width: 100%;
  height: 20px;
`;

const MapWrapperInner = styled.div`
  height: 265px;
`;

export interface Props {
  address: string;
  position: GeoJSON.Point;
  id: string;
  className?: string;
}

interface State {
  showMap: boolean;
}

class IdeaMap extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showMap: false
    };
  }

  handleMapToggle = () => {
    this.setState(({ showMap }) => ({ showMap: !showMap }));
  }

  render() {
    const { address, position, className } = this.props;
    const { showMap } = this.state;
    const points: any = [{ ...location }];
    const center = position.coordinates;

    return (
      <Container className={className}>
        <LocationButton id="e2e-map-toggle" onClick={this.handleMapToggle}>
          <Location>
            <LocationIcon name="position" />
            <LocationLabel>
              {address}
            </LocationLabel>
          </Location>
          <ArrowIcon name="dropdown" className={showMap ? 'open' : ''}/>
        </LocationButton>
        <CSSTransition
          classNames="map"
          in={showMap}
          timeout={300}
          mountOnEnter={true}
          unmountOnExit={true}
          exit={true}
        >
          <MapWrapper>
            <MapWrapperInner>
              <Map
                points={points}
                center={center}
              />
            </MapWrapperInner>
          </MapWrapper>
        </CSSTransition>

        {showMap && <MapPaddingBottom />}
      </Container>
    );
  }
}

export default IdeaMap;
