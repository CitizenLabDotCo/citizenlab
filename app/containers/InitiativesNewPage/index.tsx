import React from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';

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

export class InitiativesNewPage extends React.PureComponent<Props> {
  redirectToSignUpPage = () => {
    clHistory.push('/sign-up');
  }
  componentDidMount() {
    const { authUser } = this.props;

    if (authUser === null) {
      this.redirectToSignUpPage();
    }
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.authUser !== this.props.authUser && this.props.authUser === null) {
      this.redirectToSignUpPage();
    }
  }
  render() {
    const { authUser, locale } = this.props;
    if (isNilOrError(authUser) || isNilOrError(locale)) return null;

    return (
      <>
        <InitiativesNewMeta/>
        <PageLayout>
          <InitiativesNewFormWrapper
            locale={locale}
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

export default () => (
  <Data>
    {dataProps => <InitiativesNewPage {...dataProps} />}
  </Data>
);
