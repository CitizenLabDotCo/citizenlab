import React from 'react';
import { isNumber } from 'lodash-es';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { reverseGeocode } from 'utils/locationTools';
import { parse } from 'qs';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { PreviousPathnameContext } from 'context';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'services/permissions/roles';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesNewMeta from './InitiativesNewMeta';
import InitiativesNewFormWrapper from './InitiativesNewFormWrapper';
import PageLayout from 'components/InitiativeForm/PageLayout';
import { ILocationInfo } from 'typings';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
  topics: GetTopicsChildProps;
  postingPermission: GetInitiativesPermissionsChildProps;
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
    const { location } = this.props;
    const { lat, lng } = parse(location.search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    this.redirectIfNotPermittedOnPage();

    if (isNumber(lat) && isNumber(lng)) {
      // When an idea is posted through the map, we Google Maps gets an approximate address,
      // but we also keep the exact coordinates from the click so the location indicator keeps its initial position on the map
      // and doesn't readjust together with the address correction/approximation
      reverseGeocode(lat, lng).then((address) => {
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

    if (
      prevProps.postingPermission !== this.props.postingPermission &&
      !isNilOrError(this.props.postingPermission)
    ) {
      this.redirectIfPostingNotEnabled();
    }
  }

  redirectIfNotPermittedOnPage = () => {
    const { authUser } = this.props;

    if (authUser === null) {
      clHistory.replace('/sign-up');
    }
  };

  redirectIfPostingNotEnabled() {
    if (
      this.props.postingPermission?.enabled !== true &&
      !isNilOrError(this.props.authUser)
    ) {
      clHistory.replace('/initiatives');
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
    const initiativeTopics = topics.filter((topic) => !isNilOrError(topic));

    return (
      <>
        <InitiativesNewMeta />
        <PageLayout isAdmin={isAdmin({ data: authUser })}>
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
  topics: <GetTopics excludeCode={'custom'} />,
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
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
