import React from 'react';
import { isNumber } from 'lodash-es';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import { reverseGeocode } from 'utils/locationTools';
import { parse } from 'qs';

// services
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { PreviousPathnameContext } from 'context';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import InitiativesNewMeta from './InitiativesNewMeta';
import InitiativesNewFormWrapper from './InitiativesNewFormWrapper';
import PageLayout from 'components/InitiativeForm/PageLayout';
import { ITopicData } from 'services/topics';

interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
  topics: GetTopicsChildProps;
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

  componentDidMount() {
    const { location } = this.props;
    const { lat, lng } = parse(location.search, { ignoreQueryPrefix: true, decoder: (str, _defaultEncoder, _charset, type) => {
      return type === 'value' ? parseFloat(str) : str;
    }}) as { [key: string]: string | number };

    this.redirectIfNotPermittedOnPage();

    if (isNumber(lat) && isNumber(lng)) {
      reverseGeocode([lat, lng]).then((location_description) => {
        this.setState({ locationInfo: {
          // When an idea is posted through the map, we Google Maps gets an approximate address,
          // but we also keep the exact coordinates from the click so the location indicator keeps its initial position on the map
          // and doesn't readjust together with the address correction/approximation
          location_description,
          location_point_geojson: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }});
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
    const isPrivilegedUser = !isNilOrError(authUser) && (isAdmin({ data: authUser }) || isModerator({ data: authUser }) || isSuperAdmin({ data: authUser }));

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace('/sign-up');
    }
  }

  render() {
    const { authUser, locale, topics } = this.props;
    const { locationInfo } = this.state;
    if (
      isNilOrError(authUser) ||
      isNilOrError(locale) ||
      isNilOrError(topics) ||
      locationInfo === undefined
    ) {
      return null;
    }
    const initiativeTopics = topics.filter(topic => !isNilOrError(topic)) as ITopicData[];

    return (
      <>
        <InitiativesNewMeta />
        <PageLayout>
          <InitiativesNewFormWrapper
            locale={locale}
            topics={initiativeTopics}
            {...locationInfo}
          />
        </PageLayout>
      </>

    );
  }
}

const Data = adopt<DataProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
  topics: <GetTopics />,
  previousPathName: ({ render }) => <PreviousPathnameContext.Consumer>{render as any}</PreviousPathnameContext.Consumer>
});

export default withRouter((inputProps: WithRouterProps) => (
  <Data>
    {dataProps => <InitiativesNewPage {...dataProps} {...inputProps} />}
  </Data>
));
