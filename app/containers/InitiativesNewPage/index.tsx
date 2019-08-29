import React from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import { reverseGeocode } from 'utils/locationTools';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import InitiativesNewMeta from './InitiativesNewMeta';
import InitiativesNewFormWrapper from './InitiativesNewFormWrapper';
import PageLayout from 'components/InitiativeForm/PageLayout';

interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps { }

interface State {
  locationInfo: undefined | null | {
    location_description: string,
    location_point_geojson: {
      type: 'Point',
      coordinates: number[]
    }
  };
}

export class InitiativesNewPage extends React.PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      locationInfo: undefined
    };
  }

  redirectToSignUpPage = () => {
    clHistory.push('/sign-up');
  }

  componentDidMount() {
    const { location, authUser } = this.props;

    if (authUser === null) {
      this.redirectToSignUpPage();
    }

    if (location && location.query && location.query.position) {
      const coordinates = JSON.parse(location.query.position);
      const lat = coordinates[0];
      const lng = coordinates[1];

      reverseGeocode(coordinates).then((location_description) => {
        this.setState({ locationInfo: {
          // When an idea is posted through the map, we Google Maps gets an approximate address,
          // but we also keep the exact coordinates from the click so the location indicator keeps its initial position on the map
          // and doesn't readjust together with the address correction/approximation
          location_description,
          location_point_geojson: {
            type: 'Point',
            coordinates: [lng, lat] as number[]
          }
        }});
      });
    } else {
      this.setState({ locationInfo: null });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.authUser !== this.props.authUser && this.props.authUser === null) {
      this.redirectToSignUpPage();
    }
  }

  render() {
    const { authUser, locale } = this.props;
    const { locationInfo } = this.state;
    if (isNilOrError(authUser) || isNilOrError(locale) || locationInfo === undefined) return null;
    return (
      <>
        <InitiativesNewMeta />
        <PageLayout>
          <InitiativesNewFormWrapper
            locale={locale}
            {...locationInfo}
          />
        </PageLayout>
      </>

    );
  }
}

const Data = adopt<DataProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />
});

export default withRouter((inputProps: WithRouterProps) => (
  <Data>
    {dataProps => <InitiativesNewPage {...dataProps} {...inputProps} />}
  </Data>
));
