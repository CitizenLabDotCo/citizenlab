import React from 'react';

import { PreviousPathnameContext } from 'context';
import { isNumber } from 'lodash-es';
import { parse } from 'qs';
import { adopt } from 'react-adopt';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { ILocationInfo } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PageLayout from 'components/InitiativeForm/PageLayout';
import PageNotFound from 'components/PageNotFound';

import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { reverseGeocode } from 'utils/locationTools';
import { isAdmin } from 'utils/permissions/roles';

import InitiativesNewFormWrapper from './InitiativesNewFormWrapper';
import InitiativesNewMeta from './InitiativesNewMeta';

interface DataProps {
  authUser: GetAuthUserChildProps;
  previousPathName: string | null;
  postingPermission: GetInitiativesPermissionsChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps {}

interface State {
  locationInfo: undefined | null | ILocationInfo;
}

export class InitiativesNewPage extends React.PureComponent<
  Props & WithRouterProps,
  State
> {
  constructor(props: Props & WithRouterProps) {
    super(props);
    this.state = {
      locationInfo: undefined,
    };
  }

  componentDidMount() {
    const { location, locale } = this.props;
    const { lat, lng } = parse(location.search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    });

    this.redirectIfNotPermittedOnPage();

    if (isNumber(lat) && isNumber(lng) && !isNilOrError(locale)) {
      // When an idea is posted through the map, we Google Maps gets an approximate address,
      // but we also keep the exact coordinates from the click so the location indicator keeps its initial position on the map
      // and doesn't readjust together with the address correction/approximation
      reverseGeocode(lat, lng, locale).then((address) => {
        this.setState({
          locationInfo: {
            location_description: address,
            location_point_geojson: {
              type: 'Point',
              coordinates: [lng, lat],
            },
          },
        });
      });
    } else {
      this.setState({ locationInfo: null });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.authUser !== this.props.authUser) {
      this.redirectIfNotPermittedOnPage();
    }
  }

  redirectIfNotPermittedOnPage = () => {
    const { authUser } = this.props;
    if (authUser === null) {
      clHistory.replace('/');
    }
  };

  render() {
    const { authUser } = this.props;
    const { locationInfo } = this.state;
    if (isNilOrError(authUser) || locationInfo === undefined) {
      return null;
    }

    return (
      <>
        <InitiativesNewMeta />
        <PageLayout isAdmin={isAdmin({ data: authUser })}>
          <InitiativesNewFormWrapper locationInfo={locationInfo} />
        </PageLayout>
      </>
    );
  }
}

const Data = adopt<DataProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render}
    </PreviousPathnameContext.Consumer>
  ),
  postingPermission: <GetInitiativesPermissions action="posting_initiative" />,
});

export default withRouter((inputProps: WithRouterProps) => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  return (
    <Data>
      {(dataProps: DataProps) => (
        <InitiativesNewPage {...dataProps} {...inputProps} />
      )}
    </Data>
  );
});
